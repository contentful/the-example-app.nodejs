pipeline {
    agent any

    stages {
        stage('run frontend') {
            steps {
                echo 'executing yarn'
                nodejs( 'nodejs10.17.0') {
                  sh 'yarn install'
                  sh 'yarn build '
                }
            }
        }
    }
}
