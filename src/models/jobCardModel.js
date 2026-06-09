const JC_INCLUDE = {
  lineItems: { orderBy: { slNo: 'asc' } },
};

export const getAllJobCards = (db) =>
  db.jobCard.findMany({
    orderBy: { createdAt: 'desc' },
    include: JC_INCLUDE,
  });

export const getJobCardById = (db, id) =>
  db.jobCard.findUnique({
    where: { id },
    include: JC_INCLUDE,
  });

export const getNextJobNo = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "jobNo" FROM job_card
    WHERE "jobNo" ~ '^[0-9]+$'
    ORDER BY "jobNo"::int DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const last = parseInt(rows[0].jobNo, 10);
    return String(last + 1);
  }
  return "1";
};

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createJobCard = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.jobCard.create({ data: headerData });
    if (detailRows.length > 0) {
      await tx.jobCardLineItem.createMany({
        data: detailRows.map((r, i) => ({ ...r, jobCardId: master.id, slNo: i + 1 })),
      });
    }
    return tx.jobCard.findUnique({
      where: { id: master.id },
      include: JC_INCLUDE,
    });
  }, TX_OPTS);

export const updateJobCard = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    if (detailRows !== undefined) {
      await tx.jobCardLineItem.deleteMany({ where: { jobCardId: id } });
    }
    await tx.jobCard.update({ where: { id }, data: headerData });
    if (detailRows !== undefined && detailRows.length > 0) {
      await tx.jobCardLineItem.createMany({
        data: detailRows.map((r, i) => ({ ...r, jobCardId: id, slNo: i + 1 })),
      });
    }
    return tx.jobCard.findUnique({
      where: { id },
      include: JC_INCLUDE,
    });
  }, TX_OPTS);

export const deleteJobCard = (db, id) =>
  db.jobCard.delete({ where: { id } });

export const upsertJobCardProcess = async (db, data) => {
  const existing = await db.jobCardLineItem.findFirst({
    where: {
      jobCardId: data.jobCardId,
      partNo: data.partNo,
      processName: data.processName,
    }
  });

  let workingStartDate = undefined;
  let workingEndDate = undefined;

  if (data.state === 'IN') {
    workingStartDate = data.processDate;
    workingEndDate = null;
  } else if (data.state === 'OUT' || data.state === 'QC') {
    workingEndDate = data.processDate;
    if (existing && existing.workingStartDate) {
      workingStartDate = existing.workingStartDate;
    } else {
      workingStartDate = data.processDate;
    }
  } else if (data.state === 'Erase') {
    workingStartDate = null;
    workingEndDate = null;
  }

  let result;
  if (existing) {
    result = await db.jobCardLineItem.update({
      where: { id: existing.id },
      data: {
        processDate: data.processDate,
        state: data.state,
        empName: data.empName,
        machineName: data.machineName,
        workCenterNo: data.workCenterNo,
        remarks: data.remarks,
        notApplicable: data.notApplicable,
        ...(workingStartDate !== undefined && { workingStartDate }),
        ...(workingEndDate !== undefined && { workingEndDate }),
      }
    });
  } else {
    const count = await db.jobCardLineItem.count({
      where: { jobCardId: data.jobCardId }
    });
    result = await db.jobCardLineItem.create({
      data: {
        ...data,
        slNo: count + 1,
        ...(workingStartDate !== undefined && { workingStartDate }),
        ...(workingEndDate !== undefined && { workingEndDate }),
      }
    });
  }

  // Handle JobCard overall workingStartDate and workingEndDate
  try {
    const jobCard = await db.jobCard.findUnique({
      where: { id: data.jobCardId },
      include: { lineItems: true }
    });

    if (jobCard) {
      let newWorkingStartDate = null;
      let newWorkingEndDate = null;

      // 1. Calculate workingStartDate: minimum of all process start dates
      const startedItems = jobCard.lineItems.filter(li => li.state === 'IN' || li.state === 'OUT' || li.state === 'QC');
      if (startedItems.length > 0) {
        const startDates = startedItems.map(li => li.workingStartDate).filter(Boolean).map(d => new Date(d).getTime());
        if (startDates.length > 0) {
          newWorkingStartDate = new Date(Math.min(...startDates));
        } else {
          newWorkingStartDate = data.processDate;
        }
      }

      // 2. Calculate workingEndDate: only set if ALL processes of ALL parts are completed
      const partNames = [...new Set(jobCard.lineItems.map(li => li.partName).filter(Boolean))];
      const processMasters = await db.processMaster.findMany({
        where: { partName: { in: partNames } }
      });

      let allCompleted = true;
      if (partNames.length === 0 || processMasters.length === 0) {
        allCompleted = false;
      } else {
        for (const partName of partNames) {
          const expectedProcs = processMasters.filter(pm => pm.partName === partName);
          for (const pm of expectedProcs) {
            const savedLi = jobCard.lineItems.find(li => li.partName === partName && li.processName === pm.processName);
            if (!savedLi || !(savedLi.state === 'OUT' || savedLi.state === 'QC' || savedLi.notApplicable)) {
              allCompleted = false;
              break;
            }
          }
          if (!allCompleted) break;
        }
      }

      if (allCompleted) {
        const endDates = jobCard.lineItems.map(li => li.workingEndDate).filter(Boolean).map(d => new Date(d).getTime());
        if (endDates.length > 0) {
          newWorkingEndDate = new Date(Math.max(...endDates));
        } else {
          newWorkingEndDate = data.processDate;
        }
      }

      await db.jobCard.update({
        where: { id: data.jobCardId },
        data: {
          workingStartDate: newWorkingStartDate,
          workingEndDate: newWorkingEndDate
        }
      });
    }
  } catch (err) {
    console.error('Error updating JobCard overall start/end dates:', err);
  }

  return result;
};

export const closeRouteCard = async (db, id) => {
  return db.$transaction(async (tx) => {
    // 1. Fetch JobCard with existing lineItems
    const jobCard = await tx.jobCard.findUnique({
      where: { id },
      include: { lineItems: true }
    });

    if (!jobCard) {
      throw new Error('Job Card not found');
    }

    // 2. Identify the parts in this JobCard (line items with null or empty processName)
    const parts = jobCard.lineItems.filter(li => !li.processName);
    
    // If there are no header line items, fallback to any unique partName in lineItems
    const partNames = parts.length > 0 
      ? parts.map(p => p.partName) 
      : [...new Set(jobCard.lineItems.map(li => li.partName).filter(Boolean))];

    // 3. Fetch processes from ProcessMaster for these parts
    const processMasters = await tx.processMaster.findMany({
      where: { partName: { in: partNames } }
    });

    const now = new Date();

    // 4. For each process of each part, upsert JobCardLineItem to be completed
    const partsList = parts.length > 0 
      ? parts 
      : partNames.map(name => ({ partName: name, partNo: jobCard.lineItems.find(li => li.partName === name)?.partNo || '' }));

    for (const part of partsList) {
      const expectedProcs = processMasters.filter(pm => pm.partName === part.partName);
      
      for (const pm of expectedProcs) {
        const existingProc = jobCard.lineItems.find(li => 
          li.partName === part.partName && 
          li.processName === pm.processName
        );

        if (existingProc) {
          // If it exists but is not completed, update it to OUT
          if (!(existingProc.state === 'OUT' || existingProc.state === 'QC' || existingProc.notApplicable)) {
            await tx.jobCardLineItem.update({
              where: { id: existingProc.id },
              data: {
                state: 'OUT',
                processDate: now,
                empName: existingProc.empName || 'admin',
                machineName: existingProc.machineName || pm.machineName || '',
                workCenterNo: existingProc.workCenterNo || pm.machineCode || '',
                remarks: existingProc.remarks ? `${existingProc.remarks} (Closed Route Card)` : 'Closed Route Card',
                workingStartDate: existingProc.workingStartDate || now,
                workingEndDate: now
              }
            });
          }
        } else {
          // Create new completed process line item
          const count = await tx.jobCardLineItem.count({
            where: { jobCardId: id }
          });
          await tx.jobCardLineItem.create({
            data: {
              jobCardId: id,
              slNo: count + 1,
              partNo: part.partNo,
              partName: part.partName,
              processName: pm.processName,
              processDate: now,
              state: 'OUT',
              empName: 'admin',
              machineName: pm.machineName || '',
              workCenterNo: pm.machineCode || '',
              remarks: 'Closed Route Card',
              workingStartDate: now,
              workingEndDate: now
            }
          });
        }
      }
    }

    // 5. Update overall job card status to 'Closed', and workingStartDate/workingEndDate
    const updatedJobCard = await tx.jobCard.update({
      where: { id },
      data: {
        status: 'Closed',
        workingStartDate: jobCard.workingStartDate || now,
        workingEndDate: now
      },
      include: JC_INCLUDE
    });

    return updatedJobCard;
  }, TX_OPTS);
};


