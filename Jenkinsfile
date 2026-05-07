pipeline {
  agent any

  environment {
    COMPOSE_DOCKER_CLI_BUILD = '1'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'npm ci'
        dir('backend') {
          sh 'npm ci'
        }
      }
    }

    stage('Run tests') {
      steps {
        sh 'npm test'
        dir('backend') {
          sh 'npm test'
        }
      }
    }

    stage('Build frontend') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Build Docker images') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Deploy containers') {
      steps {
        sh 'docker compose up -d'
      }
    }
  }
}
