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
  }
}