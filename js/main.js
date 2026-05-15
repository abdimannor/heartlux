// Page navigation
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

// Age range slider
const ageRange = document.getElementById('ageRange');
const ageDisplay = document.getElementById('ageDisplay');

if (ageRange) {
  ageRange.addEventListener('input', (e) => {
    ageDisplay.textContent = e.target.value;
  });
}

// Option card selection
function selectOption(category, value, element) {
  const cards = element.parentElement.querySelectorAll('.option-card');
  cards.forEach(card => card.classList.remove('selected'));
  element.classList.add('selected');
  localStorage.setItem(`heartlux_${category}`, value);
}

// Handle registration form
function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const gender = document.querySelector('input[name="gender"]:checked').value;

  // Validation
  if (password.length < 8) {
    alert('Lösenordet måste vara minst 8 tecken långt');
    return;
  }

  if (password !== confirmPassword) {
    alert('Lösenorden matchar inte');
    return;
  }

  // Store user data in localStorage (simple demo)
  const userData = {
    username,
    email,
    password: '***',
    gender,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('heartlux_user', JSON.stringify(userData));

  // Show success message
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('successMessage').classList.add('show');

  // Reset form
  setTimeout(() => {
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('successMessage').classList.remove('show');
    document.getElementById('registerForm').reset();
    showPage('home');
  }, 2000);
}

// Finish setup
function finishSetup() {
  const interest = localStorage.getItem('heartlux_interest');
  const age = document.getElementById('ageRange').value;
  const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
    .map(checkbox => checkbox.value);

  if (!interest) {
    alert('Välj vem du vill möta');
    return;
  }

  if (interests.length === 0) {
    alert('Välj minst ett intresse');
    return;
  }

  // Store preferences
  const preferences = {
    interest,
    age,
    interests,
    completedAt: new Date().toISOString()
  };

  localStorage.setItem('heartlux_preferences', JSON.stringify(preferences));

  // Show success
  const setupDiv = document.querySelector('.selector-section');
  const originalContent = setupDiv.innerHTML;

  setupDiv.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">💗</div>
      <h2>Profilen är klar!</h2>
      <p style="margin: 1rem 0; color: #666;">Din profil är nu aktiv. Dags att börja utforska nya anslutningar.</p>
      <button class="btn btn-primary btn-lg" onclick="showPage('home')" style="margin-top: 1.5rem;">
        Tillbaka till Startsidan
      </button>
    </div>
  `;

  setTimeout(() => {
    setupDiv.innerHTML = originalContent;
    location.reload();
  }, 3000);
}

// Load any stored preferences on page load
document.addEventListener('DOMContentLoaded', () => {
  const storedInterest = localStorage.getItem('heartlux_interest');
  if (storedInterest) {
    // Highlight the selected card if preferences exist
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(card => {
      if (card.textContent.toLowerCase().includes(storedInterest)) {
        card.classList.add('selected');
      }
    });
  }
});
