document.addEventListener('DOMContentLoaded', function() {
  // =========================================================================
  // Section 1: Basic Initialization (AOS, Tooltips, Tabs)
  // =========================================================================

  // 1. AOS (Animate On Scroll) initialization
  AOS.init({
    duration: 1000,
    once: true,
    offset: 100
  });

  // 2. Initialize Bootstrap tooltips (if any)
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  if (tooltipTriggerList.length > 0) {
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  // 3. Setup tab functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        // Remove active class from all panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        // Activate clicked button and corresponding pane
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId + '-tab').classList.add('active');
      });
    });
  }


  // =========================================================================
  // Section 2: “Learn More” Button Functionality for Technique Cards
  // =========================================================================

  const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
  if (learnMoreButtons.length > 0) {
    learnMoreButtons.forEach(button => {
      button.addEventListener('click', function() {
        const detailsSection = this.nextElementSibling;
        // Toggle the details section
        detailsSection.classList.toggle('active');
        // Update button text
        this.textContent = detailsSection.classList.contains('active') ? 'Show Less' : 'Learn More';
      });
    });
  }


  // =========================================================================
  // Section 3: Modal Functionality (Mental Health Quiz and More)
  // =========================================================================

  // Main setup function for all modals on the page
  function setupModals() {
    // Create .modals-container if it doesn't exist
    if (!document.querySelector('.modals-container')) {
      const modalsContainer = document.createElement('div');
      modalsContainer.className = 'modals-container';
      document.body.appendChild(modalsContainer);
    }

    // If on the mental wellbeing page, load quiz modal
    if (document.querySelector('.mental-wellbeing-page')) {
      setupMentalHealthQuizModal();
    }
  }

  // Setup the Mental Health Quiz modal
  function setupMentalHealthQuizModal() {
    const modalsContainer = document.querySelector('.modals-container');

    // Create floating icon
    const quizIcon = document.createElement('div');
    quizIcon.className = 'floating-icon quiz-icon';
    quizIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
    quizIcon.setAttribute('title', 'Mental Health Quiz');
    document.body.appendChild(quizIcon);

    // Insert quiz modal HTML
    const quizModalHTML = `
      <div id="quiz-modal" class="modal-container quiz-modal">
        <div class="modal-content">
          <button class="modal-close"><i class="fas fa-times"></i></button>
          <div class="modal-header">
            <h2>Mental Health Self-Assessment</h2>
          </div>
          <div class="modal-body">
            <div class="quiz-questions">
              <div class="quiz-question" data-question="1" style="display: block;">
                <h3>1. How often do you feel overwhelmed by schoolwork?</h3>
                <div class="quiz-options">
                  <div class="quiz-option" data-value="1">Rarely or never</div>
                  <div class="quiz-option" data-value="2">Sometimes, but I can manage it</div>
                  <div class="quiz-option" data-value="3">Often, and it affects my sleep or mood</div>
                  <div class="quiz-option" data-value="4">Almost all the time</div>
                </div>
              </div>

              <div class="quiz-question" data-question="2" style="display: none;">
                <h3>2. Do you have someone you can talk to when you're feeling down?</h3>
                <div class="quiz-options">
                  <div class="quiz-option" data-value="1">Yes, several people I trust</div>
                  <div class="quiz-option" data-value="2">One or two people</div>
                  <div class="quiz-option" data-value="3">Not really, I keep things to myself</div>
                  <div class="quiz-option" data-value="4">No one I feel comfortable talking to</div>
                </div>
              </div>

              <div class="quiz-question" data-question="3" style="display: none;">
                <h3>3. How would you rate your sleep quality?</h3>
                <div class="quiz-options">
                  <div class="quiz-option" data-value="1">I sleep well most nights</div>
                  <div class="quiz-option" data-value="2">Sometimes have trouble sleeping</div>
                  <div class="quiz-option" data-value="3">Often have trouble falling or staying asleep</div>
                  <div class="quiz-option" data-value="4">My sleep is constantly poor</div>
                </div>
              </div>

              <div class="quiz-question" data-question="4" style="display: none;">
                <h3>4. How often do you take time for activities you enjoy?</h3>
                <div class="quiz-options">
                  <div class="quiz-option" data-value="1">Regularly, it's a priority</div>
                  <div class="quiz-option" data-value="2">Sometimes, when I have time</div>
                  <div class="quiz-option" data-value="3">Rarely, school takes most of my time</div>
                  <div class="quiz-option" data-value="4">Almost never</div>
                </div>
              </div>
              <div class="quiz-question" data-question="5" style="display: none;">
                <h3>5. How often do you experience feelings of anxiety or worry?</h3>
                <div class="quiz-options">
                  <div class="quiz-option" data-value="1">Rarely or never</div>
                  <div class="quiz-option" data-value="2">Occasionally</div>
                  <div class="quiz-option" data-value="3">Frequently</div>
                  <div class="quiz-option" data-value="4">Almost constantly</div>
                </div>
              </div>
              <div class="quiz-question" data-question="6" style="display: none;">
                <h3>6. How satisfied are you with your current level of social connection?</h3>
                <div class="quiz-options">
                  <div class="quiz-option" data-value="1">Very satisfied</div>
                  <div class="quiz-option" data-value="2">Somewhat satisfied</div>
                  <div class="quiz-option" data-value="3">Somewhat dissatisfied</div>
                  <div class="quiz-option" data-value="4">Very dissatisfied</div>
                </div>
              </div>
              <div class="quiz-question" data-question="7" style="display: none;">
                <h3>7. How effectively do you manage your time and responsibilities?</h3>
                <div class="quiz-options">
                  <div class="quiz-option" data-value="1">Very effectively</div>
                  <div class="quiz-option" data-value="2">Moderately effectively</div>
                  <div class="quiz-option" data-value="3">Somewhat ineffectively</div>
                  <div class="quiz-option" data-value="4">Very ineffectively</div>
                </div>
              </div>
            </div>

            <div id="quiz-results" style="display: none; margin-top: 2rem; padding: 1.5rem; background: rgba(123, 75, 255, 0.1); border-radius: 10px;">
              <h3>Your Results</h3>
              <p id="results-text">
                Based on your responses, you appear to be managing well with some moderate stress. Continue using healthy coping strategies and don't hesitate to reach out if things get more difficult.
              </p>
              <div class="result-resources" style="margin-top: 1rem;">
                <h4>Recommended Resources:</h4>
                <ul style="list-style-type: none; padding: 0;">
                  <li style="margin-bottom: 0.5rem;"><a href="resources.html#student-resources">Student Support Resources</a></li>
                  <li style="margin-bottom: 0.5rem;"><a href="resources.html#stress-management">Stress Management Techniques</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    modalsContainer.insertAdjacentHTML('beforeend', quizModalHTML);

    // Show quiz on icon click
    quizIcon.addEventListener('click', function() {
      document.getElementById('quiz-modal').classList.add('active');
      document.body.style.overflow = 'hidden';
      resetQuiz();
    });

    // Close quiz modal
    document.querySelector('#quiz-modal .modal-close').addEventListener('click', function() {
      document.getElementById('quiz-modal').classList.remove('active');
      document.body.style.overflow = '';
    });

    // Handle quiz option selection (auto-progression)
    const modalQuizOptions = document.querySelectorAll('#quiz-modal .quiz-option');
    modalQuizOptions.forEach(option => {
      option.addEventListener('click', function() {
        // Deselect siblings
        const siblings = this.parentElement.querySelectorAll('.quiz-option');
        siblings.forEach(sib => sib.classList.remove('selected'));

        // Select this option
        this.classList.add('selected');

        // Move to next question
        const currentQuestion = parseInt(this.closest('.quiz-question').getAttribute('data-question'));
        setTimeout(() => {
          if (currentQuestion < 7) {
            document.querySelector(`.quiz-question[data-question="${currentQuestion}"]`).style.display = 'none';
            document.querySelector(`.quiz-question[data-question="${currentQuestion + 1}"]`).style.display = 'block';
          } else {
            // If last question, show results
            showQuizResults();
          }
        }, 500);
      });
    });

    // Reset quiz to first question
    function resetQuiz() {
      // Show only the first question
      document.querySelectorAll('#quiz-modal .quiz-question').forEach(question => {
        const questionNum = parseInt(question.getAttribute('data-question'));
        question.style.display = (questionNum === 1) ? 'block' : 'none';
      });
      // Clear selections
      document.querySelectorAll('#quiz-modal .quiz-option').forEach(option => {
        option.classList.remove('selected');
      });
      // Hide results
      document.getElementById('quiz-results').style.display = 'none';
    }

    // Calculate score and display quiz results
    function showQuizResults() {
      const resultsSection = document.getElementById('quiz-results');
      resultsSection.style.display = 'block';

      let totalScore = 0;
      let answeredQuestions = 0;
      // Sum all selected values
      document.querySelectorAll('#quiz-modal .quiz-option.selected').forEach(selected => {
        totalScore += parseInt(selected.getAttribute('data-value'));
        answeredQuestions++;
      });
      // Basic interpretation of average score
      const resultsText = document.getElementById('results-text');
      if (answeredQuestions > 0) {
        const avgScore = totalScore / answeredQuestions;
        if (avgScore < 2) {
          resultsText.textContent =
            "Based on your responses, you appear to be managing well with minimal stress. Continue your healthy habits and self-care practices.";
        } else if (avgScore < 3) {
          resultsText.textContent =
            "Based on your responses, you appear to be experiencing moderate stress. Consider incorporating more stress-management techniques into your routine.";
        } else {
          resultsText.textContent =
            "Based on your responses, you may be experiencing significant stress. Consider reaching out to a trusted adult, school counselor, or mental health professional for additional support.";
        }
      }
    }
  }

  // Initialize modals on page load
  setupModals();


  // =========================================================================
  // Section 4: Interactive Infographic Elements
  // =========================================================================

  // Toggle expanded state on infographic elements
  const infoGraphicElements = document.querySelectorAll('.infographic-element');
  if (infoGraphicElements.length > 0) {
    infoGraphicElements.forEach(element => {
      element.addEventListener('click', function() {
        this.classList.toggle('expanded');
      });
    });
  }


  // =========================================================================
  // Section 5: Animated Counters for Statistics (Intersection Observer)
  // =========================================================================

  function animateValue(obj, start, end, duration) {
    if (!obj) return;
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const observerOptions = { threshold: 0.5 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // For mental wellbeing page stats (data-target)
        const targetStats = entry.target.querySelectorAll('.stat-number[data-target]');
        if (targetStats.length > 0) {
          targetStats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            animateValue(stat, 0, target, 2000);
          });
        } 
        // For physical wellbeing page stats (data-value)
        else {
          const valueStats = entry.target.querySelectorAll('.stat-number[data-value]');
          valueStats.forEach(stat => {
            const value = parseInt(stat.getAttribute('data-value'), 10);
            animateValue(stat, 0, value, 2000);
          });
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const statsSection = document.querySelector('.statistics-section');
  if (statsSection) {
    observer.observe(statsSection);
  }


  // =========================================================================
  // Section 6: Particles.js Initialization (If Available)
  // =========================================================================

  const particlesElement = document.getElementById('particles-js');
  if (particlesElement && typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#0066BB' },   // Light blue
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#003388',           // Medium blue
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 6,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        }
      },
      retina_detect: true
    });
  }


  // =========================================================================
  // Section 7: Technique Cards (Expand/Collapse)
  // =========================================================================

  const techniqueCards = document.querySelectorAll('.technique-card');
  if (techniqueCards.length > 0) {
    techniqueCards.forEach(card => {
      card.addEventListener('click', function() {
        this.classList.toggle('expanded');
      });
    });
  }


  // =========================================================================
  // Section 8: Interactive Weekly Planner
  // =========================================================================

  function setupWeeklyPlanner() {
    const timeSlots = document.querySelectorAll('.planner-grid .time-slot');
    if (timeSlots.length > 0) {
      const activityTypes = [
        { name: 'Study', color: '#ffb74d' },
        { name: 'Break', color: '#81c784' },
        { name: 'Exercise', color: '#64b5f6' },
        { name: 'Social', color: '#ba68c8' },
        { name: 'Clear', color: 'transparent' }
      ];
      let currentActivityIndex = 0;

      timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
          const activity = activityTypes[currentActivityIndex];
          // If "Clear," reset slot
          if (activity.name === 'Clear') {
            this.style.backgroundColor = '';
            this.textContent = this.textContent.split('\n')[0];
          } else {
            // Otherwise, color the slot
            this.style.backgroundColor = activity.color;
            const timeText = this.textContent.split('\n')[0];
            this.textContent = `${timeText}\n${activity.name}`;
          }
          // Cycle to next activity type
          currentActivityIndex = (currentActivityIndex + 1) % activityTypes.length;
        });
      });
    }
  }

  // Initialize weekly planner if on the relevant page
  if (document.querySelector('.interactive-planner')) {
    setupWeeklyPlanner();
  }


  // =========================================================================
  // Section 9: Chart.js Visualizations
  // =========================================================================

  // 1. Student Mental Health Trends (Line Chart)
  const ctx1 = document.getElementById("trendChart")?.getContext("2d");
  if (ctx1) {
    new Chart(ctx1, {
      type: "line",
      data: {
        labels: ["2019", "2020", "2021", "2022", "2023"],
        datasets: [{
          label: "Stress Levels",
          data: [45, 65, 58, 52, 48],
          borderColor: "rgba(103, 58, 183, 0.8)",
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#b2bac2",
              font: { size: 11 },
              padding: 10
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            },
            ticks: {
              color: "#b2bac2"
            }
          },
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            },
            ticks: {
              color: "#b2bac2"
            }
          }
        }
      }
    });
  }

  // 2. Coping Mechanisms Effectiveness (Bar Chart)
  const ctx2 = document.getElementById("copingMechanismsChart")?.getContext("2d");
  if (ctx2) {
    new Chart(ctx2, {
      type: "bar",
      data: {
        labels: ["Exercise", "Meditation", "Social Support", "Hobbies", "Professional Help"],
        datasets: [{
          label: "Effectiveness Rating",
          data: [75, 68, 82, 71, 85],
          backgroundColor: [
            "rgba(103, 58, 183, 0.8)",
            "rgba(33, 150, 243, 0.8)",
            "rgba(0, 188, 212, 0.8)",
            "rgba(76, 175, 80, 0.8)",
            "rgba(255, 193, 7, 0.8)"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            },
            ticks: {
              color: "#b2bac2"
            }
          },
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            },
            ticks: {
              color: "#b2bac2"
            }
          }
        }
      }
    });
  }

  // 3. Academic Stress Correlation (Radar Chart)
  const ctx3 = document.getElementById("academicStressChart")?.getContext("2d");
  if (ctx3) {
    new Chart(ctx3, {
      type: "radar",
      data: {
        labels: ["Exams", "Homework", "Time Management", "Peer Pressure", "Future Planning"],
        datasets: [{
          label: "Stress Impact",
          data: [85, 65, 75, 60, 80],
          backgroundColor: "rgba(103, 58, 183, 0.2)",
          borderColor: "rgba(103, 58, 183, 0.8)",
          pointBackgroundColor: "rgba(103, 58, 183, 1)"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#b2bac2",
              font: { size: 11 },
              padding: 10
            }
          }
        },
        scales: {
          r: {
            angleLines: {
              color: "rgba(255, 255, 255, 0.1)"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            },
            pointLabels: {
              color: "#b2bac2"
            },
            ticks: {
              color: "#b2bac2",
              backdropColor: "transparent"
            }
          }
        }
      }
    });
  }

  // 4. Resource Utilization (Pie Chart)
  const ctx4 = document.getElementById("resourceUtilizationChart")?.getContext("2d");
  if (ctx4) {
    new Chart(ctx4, {
      type: "pie",
      data: {
        labels: [
          "School Counselors",
          "Mental Health Apps",
          "Peer Support Groups",
          "Online Resources",
          "Professional Therapy",
          "No Resources Used"
        ],
        datasets: [{
          data: [24, 18, 22, 15, 12, 9],
          backgroundColor: [
            "rgba(103, 58, 183, 0.8)",
            "rgba(33, 150, 243, 0.8)",
            "rgba(0, 188, 212, 0.8)",
            "rgba(76, 175, 80, 0.8)",
            "rgba(255, 193, 7, 0.8)",
            "rgba(255, 87, 34, 0.8)"
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#b2bac2",
              font: { size: 11 },
              padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  }


  // =========================================================================
  // Section 10: Resource Expansion & Tabs (Students, Parents, Teachers)
  // =========================================================================

  // 1. Expand/collapse student resources
  const expandButtons = document.querySelectorAll('.expand-resource-btn');
  if (expandButtons.length > 0) {
    expandButtons.forEach(button => {
      button.addEventListener('click', function() {
        const resourcesSection = this.nextElementSibling;
        resourcesSection.classList.toggle('active');
        this.textContent = resourcesSection.classList.contains('active') ? 'Hide Resources' : 'View Resources';
      });
    });
  }

  // 2. Region tabs for student resources
  const regionTabs = document.querySelectorAll('.region-tab');
  if (regionTabs.length > 0) {
    regionTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.region-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.region-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const regionId = this.getAttribute('data-region');
        document.getElementById(regionId + '-content').classList.add('active');
      });
    });
  }

  // 3. Parent Resources (Accordion)
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  if (accordionHeaders.length > 0) {
    accordionHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const accordionItem = this.parentElement;
        accordionItem.classList.toggle('active');
      });
    });
  }

  // 4. Teacher Resources (Tabs)
  const tabNavItems = document.querySelectorAll('.tab-nav-item');
  if (tabNavItems.length > 0) {
    tabNavItems.forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('.tab-nav-item').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId + '-content').classList.add('active');
      });
    });
  }

  // 5. "Try It" buttons for teacher strategies
  const tryItButtons = document.querySelectorAll('.try-it-btn');
  if (tryItButtons.length > 0) {
    tryItButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const content = this.nextElementSibling;
        content.classList.toggle('active');
        this.innerHTML = content.classList.contains('active')
          ? 'Hide Example <i class="fas fa-arrow-up"></i>'
          : 'Try This <i class="fas fa-arrow-right"></i>';
      });
    });
  }
});
