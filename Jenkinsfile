pipeline { 
    environment { 
        registry = "veekrum/cicd_demo" 
        registryCredential = "veekrum" 
        dockerImage = '' 
    }
    agent any 
    stages { 
        stage('Cloning our Git') { 
            steps { 
                git 'https://github.com/veekrum/the-example-app.nodejs.git' 
            }
        } 
        stage('Build') {
            steps{
                sh 'npm install'
            }
        }
        stage('Building our image') { 

            steps { 
                script { 
                    dockerImage = docker.build registry + ":latest" 
                }
            } 
        }
        stage('pushing our image') { 
            steps { 
                script { 
                    docker.withRegistry( '', registryCredential ) { 
                        dockerImage.push() 
                    }
                } 
            }
        } 
        stage('Cleaning up') { 
            steps { 
                sh "docker rmi $registry:latest" 
            }
        } 
    }
}
