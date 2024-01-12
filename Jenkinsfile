def FAILED_STAGE
pipeline {
    agent any
    tools {
        nodejs 'nodejs'
    }
    parameters {
        choice choices: ["Baseline", "APIS", "Full"],
            description: 'Type of scan that is going to perform inside the container',
            name: 'SCAN_TYPE'

        string defaultValue: "http://10.1.113.110:3000",
            description: 'Target URL to scan',
            name: 'TARGET'

        booleanParam defaultValue: true,
            description: 'Parameter to know if wanna generate report.',
            name: 'GENERATE_REPORT'    
    }
    environment {
        DOCKERHUB_USERNAME = 'devopsvconn'
        APP_NAME = 'devsecops-pipeline-demo'
        IMAGE_TAG = "${BUILD_NUMBER}"
        IMAGE_NAME = "${DOCKERHUB_USERNAME}/${APP_NAME}"
        REGISTRY_CREDS = 'dockerhub'
    }
    stages {
        stage('Cleanup Workspace') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    cleanWs()
                }
            }
        }
        stage('Checkout git') {
            steps {
                script {
                    FAILED_STAGE = env.STAGE_NAME
                }
                
                timeout(time: 10, unit: 'MINUTES') {
                    // Set the timeout duration according to your needs
                    
                    // Body of the timeout step
                    git credentialsId: 'github',
                        url: 'https://github.com/devopsvconn/vconn-devsecops.git',
                        branch: 'master'
                }
            }
        }

        stage('SonarQube Analysis'){
            steps{
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    withSonarQubeEnv('sonarqube') {                         
                            sh """
                                /home/sonar/bin/sonar-scanner \
                                -Dsonar.projectKey=demoapp \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://10.1.113.110:9000 \
                                -Dsonar.token=sqp_5e4b37800dc60897b44cdaa8763251ad1a6f3cf1
                            """
                    }
                }    
            }
        }
        stage("Quality Gate") {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                } 
            timeout(time: 1, unit: 'HOURS') {
                waitForQualityGate abortPipeline: false
            }
            }
        }

        stage("Trivy files scanning") {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                }
                sh """
                    echo "This step is for detailed file scanning"
                    cd /home/trivy
                    mkdir project
                    chmod -R 777 project; cd project
                    git clone -b master --single-branch https://github.com/devopsvconn/vconn-devsecops.git
                    cd ..
                    trivy fs --severity HIGH,CRITICAL -f table -o /home/trivy/reports/report-${BUILD_NUMBER}.txt project/
                    rm -rf project
                """  
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    docker_image = docker.build(IMAGE_NAME)
                }
            }
        }
        stage("Application run on port") {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    sh """
                        docker run -d -p 3000:3000 --name myapp ${IMAGE_NAME}:latest
                    """
                }
            }
        }
        stage('Pipeline Info') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    echo "<--Parameter Initialization-->"
                    echo """
                    The current parameters are:
                        Scan Type: ${params.SCAN_TYPE}
                        Target: ${params.TARGET}
                        Generate report: ${params.GENERATE_REPORT}
                    """
                }
            }
        }

        stage('Setting up OWASP ZAP docker container') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    echo "Pulling up last OWASP ZAP container --> Start"
                    sh 'docker pull owasp/zap2docker-stable'
                    echo "Pulling up last VMS container --> End"
                    echo "Starting container --> Start"
                    sh """
                    docker run -dt --name owasp \
                    owasp/zap2docker-stable \
                    /bin/bash
                    """
                }
            }
        }

        stage('Prepare wrk directory') {
            when {
                environment name: 'GENERATE_REPORT', value: 'true'
            }
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    sh """
                    docker exec owasp \
                    mkdir /zap/wrk
                    """
                }
            }
        }

        stage('Scanning target on owasp container') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    def scan_type = "${params.SCAN_TYPE}"
                    echo "----> scan_type: $scan_type"
                    def target = "${params.TARGET}"
                    if (scan_type == "Baseline") {
                        sh """
                        docker exec owasp \
                        zap-baseline.py \
                        -t $target \
                        -x report.xml \
                        -I
                        """
                    } else if (scan_type == "APIS") {
                        sh """
                        docker exec owasp \
                        zap-api-scan.py \
                        -t $target \
                        -x report.xml \
                        -I
                        """
                    } else if (scan_type == "Full") {
                        sh """
                        docker exec owasp \
                        zap-full-scan.py \
                        -t $target \
                        -x report.xml \
                        -I
                        """
                        // -x report-$(date +%d-%b-%Y).xml
                    } else {
                        echo "Something went wrong..."
                    }
                }
            }
        }

        stage('Copy Report to Workspace') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    sh '''
                    docker cp owasp:/zap/wrk/report.xml ${WORKSPACE}/ZAP-report-${BUILD_NUMBER}.xml
                    mv ${WORKSPACE}/ZAP-report-${BUILD_NUMBER}.xml /home/DAST
                    '''
                }
            }
        }
        stage("Stopping application container") {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    sh """
                        docker stop myapp
                        docker rm -f myapp
                    """
                }
            }
        }

        stage('Docker login & pushing image') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    docker.withRegistry('', REGISTRY_CREDS) {
                        docker_image.push(BUILD_NUMBER)
                        docker_image.push('latest')
                    }
                }
            }
        }

        stage('Image Scan') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                }
                //sh ' docker run --rm --name trivy bitnami/trivy:latest image muhammadfarjad/test-cicd:$BUILD_NUMBER '
                sh """
                    mkdir -p /home/trivy/reports
                    #chmod 777 /home/trivy/reports
                    cd /home/trivy/reports
                    touch image-results-${BUILD_NUMBER}.txt
                    trivy image --format table -o /home/trivy/reports/image-results-${BUILD_NUMBER}.txt $IMAGE_NAME:latest
                """ 
                
            }
        }
        stage('Delete Docker Images') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker rmi ${IMAGE_NAME}:latest"
                }
            }
        }        
        stage('Checkout Demoapp-Argo-CD') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    git credentialsId: 'github',
                        url: 'https://github.com/devopsvconn/Ecommerce-gitops.git',
                        branch: 'main'
                }
            }
        }

        stage('Updating Kubernetes Deployment file') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    sh """
                    cat FrontendDeploy.yml
                    sed -i 's|image: ${IMAGE_NAME}.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|' FrontendDeploy.yml
                    cat FrontendDeploy.yml
                    """
                }
            }
        }
        stage('Push The Changed Deployment File To Git') {
            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    sh """
                    git config --global user.name "devopsvconn"
                    git config --global user.email "vconndevops@gmail.com"
                    git add FrontendDeploy.yml
                    git commit -m "Update the deployment file"
                    """
                    withCredentials([gitUsernamePassword(credentialsId: 'github', gitToolName: 'Default')]) {
                        sh "git push https://github.com/devopsvconn/Ecommerce-gitops.git main"  
                        // sh "git pull origin main"
                        // sh "git add ."
                        // sh "git commit -m 'Merge remote changes'"
                        // sh "git push origin main"
                    }
                }
            }
        }
    }    
    post {
        failure {
            script {
                echo "Failed stage name: ${FAILED_STAGE}"
                sh """
                    docker stop myapp
                    docker rm -f myapp
                    rm -rf /home/trivy/project
                """
                withCredentials([string(credentialsId: 'ntfy', variable: 'SECRET_VARIABLE')]) {
                    sh """
                        curl \
                        -u :${SECRET_VARIABLE} \
                        -H "Title: Failure Details" \
                        -d "Pipeline failed in the stage: ${FAILED_STAGE}\nCheck the jenkins job for details." \
                        http://139.135.57.219:7012/DevSecOps-FrontEnd
                    """
                }
            }
        }
        success {
            script {
                withCredentials([string(credentialsId: 'ntfy', variable: 'SECRET_VARIABLE')]) {
                    sh """
                        curl \
                        -u :${SECRET_VARIABLE} \
                        -H "Title: Front End Pipeline Status" \
                        -d "The status of your built-${BUILD_NUMBER} is ${currentBuild.result}." \
                        http://139.135.57.219:7012/DevSecOps-FrontEnd # Here the top should be revised     
                    """
                }             
            } 
        }
        always {
            script {
                echo "Removing container"
                sh '''
                docker stop owasp
                docker rm owasp
                '''
            }
        }      
    }    
}
