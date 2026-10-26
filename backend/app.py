from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database.database import db
from database import models

from api.auth import auth_bp
from api.news import news_bp
from api.summary import summary_bp
from api.podcast import podcast_bp
from api.settings import settings_bp
from scheduler import start_scheduler

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "http://localhost:5173",
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(news_bp)
    app.register_blueprint(summary_bp)
    app.register_blueprint(podcast_bp)
    app.register_blueprint(settings_bp)

    with app.app_context():
        db.create_all()
    
    start_scheduler(app)

    @app.route("/")
    def home():
        return jsonify({
            "name": "Podcast Buddy AI",
            "status": "running",
            "version": "1.0.0"
        })

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy",
            "service": "Podcast Buddy AI API"
        })

    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({
            "error": "Resource not found",
            "message": "The requested resource does not exist.",
            "code": "NOT_FOUND"
        }), 404


    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected server error occurred.",
            "code": "INTERNAL_ERROR"
        }), 500
    
    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )