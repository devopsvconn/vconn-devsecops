pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'kanwarsaad'
        APP_NAME = 'frontendbazar'
        IMAGE_TAG = "${BUILD_NUMBER}"
        IMAGE_NAME = "${DOCKERHUB_USERNAME}/${APP_NAME}"
        REGISTRY_CREDS = 'dockerhub'
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                script {
                    cleanWs()
                }
            }
        }
        
        stage('Checkout BAZAR-FRONTEND') {
            steps {
                script {
                    git credentialsId: 'github',
                        url: 'https://github.com/kanwarsaadali/BAZAR-FRONTEND.git',
                        branch: 'main'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker_image = docker.build(IMAGE_NAME)
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('', REGISTRY_CREDS) {
                        docker_image.push(BUILD_NUMBER)
                        docker_image.push('latest')
                    }
                }
            }
        }
        
        stage('Delete Docker Images') {
            steps {
                script {
                    sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker rmi ${IMAGE_NAME}:latest"
                }
            }
        }
        
        stage('Checkout Bazar-Argo-CD') {
            steps {
                script {
                    git credentialsId: 'github',
                        url: 'https://github.com/kanwarsaadali/bazar-argocd.git',
                        branch: 'main'
                }
            }
        }
        
//         // stage('Updating Kubernetes Deployment file') {
//         //     steps {
//         //         script {
//         //             sh """
//         //             //   cat frontenddeploy.yml
//         //             //   sed -i "s/${APP_NAME}.*/${APP_NAME}:${IMAGE_TAG}/g" frontenddeploy.yml
//         //             //   cat frontenddeploy.yml
//         //               cat frontenddeploy.yml
//         //               sed -i "s|image: ${IMAGE_NAME}.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|g" frontenddeploy.yml
//         //               cat frontenddeploy.yml
//         //             """
//         //         }
//         //     }
//         // }
        
           stage('Updating Kubernetes Deployment file') {
    steps {
        script {
            sh """
              cat frontenddeploy.yml
              sed -i 's|image: ${IMAGE_NAME}.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|' frontenddeploy.yml
              cat frontenddeploy.yml
            """
        }
    }
}


        stage('Push The Changed Deployment File To Git') {
            steps {
                script {
                    sh """
                      git config --global user.name "kanwarsaad"
                      git config --global user.email "kanwarsaad@gmail.com"
                      git add frontenddeploy.yml
                      git commit -m "Update the deployment file"
                    """
                    withCredentials([gitUsernamePassword(credentialsId: 'github', gitToolName: 'Default')]) {
                        sh "git push https://github.com/kanwarsaadali/bazar-argocd.git main"  
                        // sh "git pull origin main"
                        // sh "git add ."
                        // sh "git commit -m 'Merge remote changes'"
                        // sh "git push origin main"
                    }
                }
            }
        }
    }
}
