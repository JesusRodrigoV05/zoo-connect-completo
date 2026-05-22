pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'zoo-connect'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Clonando el Repositorio...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Construyendo imagenes Docker...'
                bat 'docker compose build --no-cache'
            }
        }

        stage('Test Backend') {
            steps {
                echo 'Ejecutando Pruebas Unitarias del Backend (Pytest 9.0.3)...'
                bat 'docker compose run --rm backend pytest tests/ -v --tb=short'
            }
        }

        stage('Test Frontend') {
            steps {
                echo 'Construyendo imagen de Pruebas del Frontend...'
                bat 'docker build --target build -t zoo-frontend-test:ci ./zoo-frontend'
                echo 'Ejecutando Pruebas Unitarias del Frontend (Vitest 4.1.7)...'
                bat 'docker run --rm zoo-frontend-test:ci bun run test:unit'
            }
            post {
                always {
                    echo 'Limpiando imagen temporal de Pruebas del Frontend...'
                    bat 'docker rmi zoo-frontend-test:ci || echo "Imagen no encontrada, omitiendo."'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deteniendo contenedores anteriores...'
                bat 'docker compose down --remove-orphans'
                echo 'Levantando Ambiente Destino...'
                bat 'docker compose up -d'
            }
        }

        stage('Verify') {
            steps {
                echo 'Verificando que los contenedores esten corriendo...'
                bat 'docker compose ps'
            }
        }

        stage('Acceptance Tests') {
            steps {
                echo 'Disparando Job de Pruebas de Aceptacion...'
                build job: 'zoo-connect-acceptance-testing-pipeline', wait: false
            }
        }
    }

    post {
        success {
            echo 'Pipeline ejecutado exitosamente. Zoo Connect Web esta corriendo y las Pruebas pasaron!'
        }
        failure {
            echo 'El Pipeline fallo. Revisar los logs de cada Stage para mas detalles.'
        }
        always {
            echo 'Pipeline finalizado.'
        }
    }
}