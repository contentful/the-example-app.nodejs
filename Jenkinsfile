pipeline {
  agent {
    node {
      label 'Test'
    }

  }
  stages {
    stage('Build') {
      steps {
        sh 'npm install'
      }
    }
  }
}