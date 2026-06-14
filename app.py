from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import cv2
import numpy as np
import base64
import os
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ========== DATABASE MODEL ==========
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    
    def __repr__(self):
        return f'<User {self.username}>'

# Create database tables
with app.app_context():
    db.create_all()

# ========== LOGIN REQUIRED DECORATOR ==========
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ---------- ADVANCED ENHANCEMENT LOGIC ----------
def advanced_underwater_enhance(img):
    """
    Advanced multi-step pipeline for underwater image enhancement.
    Features: Dynamic Color Balancing, Contrast Limited Adaptive Histogram Equalization, 
    Saturation Boosting, and Detail Sharpening.
    """
    import numpy as np
    
    # 1. Advanced Color Balance (Compensate for underwater light absorption)
    result = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    avg_a = np.average(result[:, :, 1])
    avg_b = np.average(result[:, :, 2])
    result[:, :, 1] = result[:, :, 1] - ((avg_a - 128) * (result[:, :, 0] / 255.0) * 1.2)
    result[:, :, 2] = result[:, :, 2] - ((avg_b - 128) * (result[:, :, 0] / 255.0) * 1.2)
    result = cv2.cvtColor(result, cv2.COLOR_LAB2BGR)
    
    # 2. Contrast Limited Adaptive Histogram Equalization (CLAHE)
    # Applied only on the luminance (L) channel to preserve color accuracy
    lab = cv2.cvtColor(result, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=2.8, tileGridSize=(8,8))
    cl = clahe.apply(l)
    
    limg = cv2.merge((cl, a, b))
    result = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    
    # 3. Dynamic Saturation Boost
    # Underwater images tend to look washed out, this brings color vibrancy back
    hsv = cv2.cvtColor(result, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    
    s = cv2.multiply(s, 1.3) # Increase saturation by 30%
    s = np.clip(s, 0, 255).astype(np.uint8)
    
    hsv = cv2.merge((h, s, v))
    result = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    
    # 4. Detail Sharpening (Unsharp Masking via Gaussian Blue)
    # Extracts the high frequency details that were scattered by the water
    gaussian_blur = cv2.GaussianBlur(result, (0, 0), 2.0)
    enhanced = cv2.addWeighted(result, 1.5, gaussian_blur, -0.5, 0)
    
    # 5. Fast Denoising to smooth out artifacts introduced by sharpening
    enhanced = cv2.fastNlMeansDenoisingColored(enhanced, None, 3, 3, 7, 21)
    
    return enhanced


# ---------- ROUTES ----------
@app.route("/")
def index():
    if 'user_id' in session:
        return redirect(url_for('enhance_page'))
    return render_template('home.html')

@app.route("/about")
def about():
    return render_template('about.html')

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "message": "Invalid username or password"}), 401
    
    return render_template("login.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        # Validation
        if not username or not email or not password or not confirm_password:
            return jsonify({"success": False, "message": "All fields are required"}), 400
        
        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400
        
        if password != confirm_password:
            return jsonify({"success": False, "message": "Passwords do not match"}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({"success": False, "message": "Username already exists"}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"success": False, "message": "Email already exists"}), 400
        
        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_password)
        
        db.session.add(new_user)
        db.session.commit()
        
        session['user_id'] = new_user.id
        session['username'] = new_user.username
        
        return jsonify({"success": True})
    
    return render_template("signup.html")

@app.route("/enhance_page")
@login_required
def enhance_page():
    return render_template("index.html", username=session.get('username'))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route("/plasma-test")
def plasma_test():
    return render_template("plasma-test.html")

@app.route("/simple-test")
def simple_test():
    return render_template("simple-test.html")

@app.route("/diagnostics")
def diagnostics():
    return render_template("diagnostics.html")


@app.route("/enhance", methods=["POST"])
@login_required
def enhance():
    file = request.files["image"]
    img = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)
    
    result = advanced_underwater_enhance(img)

    _, buffer = cv2.imencode(".jpg", result)
    encoded = base64.b64encode(buffer).decode("utf-8")

    return jsonify({"image": encoded})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
