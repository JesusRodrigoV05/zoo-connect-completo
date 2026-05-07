pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'zoo-connect'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Clonando el repositorio...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Construyendo imagenes Docker...'
                bat 'docker compose build --no-cache'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deteniendo contenedores anteriores...'
                bat 'docker compose down --remove-orphans'
                echo 'Levantando ambiente destino...'
                bat 'docker compose up -d'
            }
        }

        stage('Verify') {
            steps {
                echo 'Verificando que los contenedores esten corriendo...'
                bat 'docker compose ps'
            }
        }
    }

    post {
        success {
            echo 'Pipeline ejecutado exitosamente. Zoo Connect Web esta corriendo!'
        }
        failure {
            echo 'El pipeline fallo. Revisar los logs.'
        }
    }
}