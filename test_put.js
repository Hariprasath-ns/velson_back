async function testPut() {
  try {
    const res = await fetch('http://localhost:3000/api/quotation-master/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerRef: 'TEST',
        currencyCode: 'INR',
        exchangeRate: 1,
        items: []
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

testPut();
