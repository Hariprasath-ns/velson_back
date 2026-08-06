pipeline {
    agent any

    tools {
        nodejs 'Node24'   // must match the name you gave it in Manage Jenkins -> Tools
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Generate Prisma Client') {
            steps {
                sh 'npx prisma generate'
            }
        }
    }

    post {
        success {
            echo "velson_back build succeeded for branch ${env.BRANCH_NAME}"
        }
        failure {
            echo "velson_back build failed for branch ${env.BRANCH_NAME}"
        }
    }
}
