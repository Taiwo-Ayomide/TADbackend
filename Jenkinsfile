pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                // Install dependencies and build your Node.js backend
                sh 'npm install'
                sh 'npm run build'  // If you have a build step
            }
        }
        stage('Test') {
            steps {
                // Run tests
                sh 'npm test'
            }
        }
        stage('Deploy') {
            steps {
                // Assuming Render auto-deploys from the GitHub repository
                // We just need to push code to the repository
                withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'Taiwo-Ayomide', passwordVariable: 'Ayomide1!$$$')]) {
                    sh 'git config --global user.email "taiwoayomide202@gmail.com"'
                    sh 'git config --global user.name "Taiwo-Ayomde"'
                    sh 'git add .'
                    sh 'git commit -m "Automated commit from Jenkins" || true'
                    sh 'git push https://Taiwo-Ayomide:Ayomide1!$$$@github.com/Taiwo-Ayomide/TADbackend.git HEAD:main'
                }
            }
        }
    }
}
