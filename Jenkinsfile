pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'npm install'
      }
    }
    stage('Unit Tests') {
      steps {
        sh 'npm run test:unit'
      }
    }
    stage('Archive') {
      steps {
        archiveArtifacts(allowEmptyArchive: true, artifacts: '*')
      }
    }
    stage('DeployToDev') {
      parallel {
        stage('DeployToDev') {
          steps {
            sh '''sudo -H -u ubuntu scp -r /var/lib/jenkins/workspace/the-example-app.nodejs_golanb/ ubuntu@10.0.0.104:/home/ubuntu/nodejsproject
'''
          }
        }
        stage('') {
          steps {
            sshPublisher(alwaysPublishFromMaster: true)
          }
        }
      }
    }
  }
}