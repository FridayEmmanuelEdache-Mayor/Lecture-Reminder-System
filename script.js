        document.addEventListener('DOMContentLoaded', () => {
            const lectureForm = document.getElementById('lecture-form');
            const lecturesContainer = document.getElementById('lectures-container');
            const lectureIdInput = document.getElementById('lecture-id');
            const submitBtn = document.getElementById('submit-btn');
            const cancelEditBtn = document.getElementById('cancel-edit-btn');
            const notificationBar = document.getElementById('notification-bar');
            const notificationText = document.getElementById('notification-text');

            // Load lectures from LocalStorage
            let lectures = JSON.parse(localStorage.getItem('lectures')) || [];

            const saveLectures = () => {
                localStorage.setItem('lectures', JSON.stringify(lectures));
            };

            const renderLectures = () => {
                lecturesContainer.innerHTML = '';
                const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                
                daysOfWeek.forEach(day => {
                    const lecturesForDay = lectures.filter(l => l.day === day);
                    if (lecturesForDay.length > 0) {
                        const dayGroup = document.createElement('div');
                        dayGroup.className = 'day-group mb-8';
                        dayGroup.innerHTML = `<h2>${day}</h2>`;
                        
                        const lecturesGrid = document.createElement('div');
                        lecturesGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

                        lecturesForDay.forEach(lecture => {
                            const lectureCard = createLectureCard(lecture);
                            lecturesGrid.appendChild(lectureCard);
                        });
                        
                        dayGroup.appendChild(lecturesGrid);
                        lecturesContainer.appendChild(dayGroup);
                    }
                });
                updateNotifications();
            };
            
            const createLectureCard = (lecture) => {
                const card = document.createElement('div');
                const today = new Date().toLocaleString('en-us', { weekday: 'long' });
                const isToday = lecture.day === today;

                card.className = `lecture-card p-5 rounded-lg shadow-lg flex flex-col justify-between ${isToday ? 'today' : ''}`;
                card.dataset.id = lecture.id;

                const [startHour, startMinute] = lecture.startTime.split(':').map(Number);
                const lectureDateTime = getNextLectureDateTime(lecture.day, startHour, startMinute);

                card.innerHTML = `
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${lecture.courseCode}</h3>
                        <p class="text-gray-600 font-medium">${lecture.lecturer}</p>
                        <div class="mt-4 space-y-2 text-sm">
                            <p class="flex items-center"><svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${formatTime(lecture.startTime)} - ${formatTime(lecture.endTime)}</p>
                            <p class="flex items-center"><svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> ${lecture.venue}</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="countdown" data-lecture-time="${lectureDateTime.toISOString()}"></div>
                        <div class="flex justify-end space-x-2 mt-4">
                            <button class="edit-btn p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                            </button>
                            <button class="delete-btn p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100 transition">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>
                `;

                return card;
            };

            const updateCountdowns = () => {
                const countdownElements = document.querySelectorAll('.countdown');
                countdownElements.forEach(el => {
                    const lectureTime = new Date(el.dataset.lectureTime);
                    const now = new Date();
                    const diff = lectureTime - now;

                    if (diff > 0) {
                        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const s = Math.floor((diff % (1000 * 60)) / 1000);
                        el.textContent = `${d}d ${h}h ${m}m ${s}s`;
                    } else {
                        el.textContent = "Started";
                    }
                });
            };
            
            const getNextLectureDateTime = (day, hour, minute) => {
                const now = new Date();
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const targetDayIndex = days.indexOf(day);
                let resultDate = new Date();
                resultDate.setHours(hour, minute, 0, 0);

                let currentDayIndex = now.getDay();
                let diff = targetDayIndex - currentDayIndex;

                if (diff < 0 || (diff === 0 && resultDate < now)) {
                    diff += 7;
                }
                
                resultDate.setDate(now.getDate() + diff);
                return resultDate;
            };

            const formatTime = (time) => {
                const [hour, minute] = time.split(':');
                const h = parseInt(hour);
                const suffix = h >= 12 ? 'PM' : 'AM';
                const formattedHour = ((h + 11) % 12 + 1);
                return `${formattedHour}:${minute} ${suffix}`;
            };

            const updateNotifications = () => {
                const today = new Date().toLocaleString('en-us', { weekday: 'long' });
                const now = new Date();
                const todaysLectures = lectures.filter(l => l.day === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
                
                let messages = [];

                if (todaysLectures.length > 0) {
                    todaysLectures.forEach(lecture => {
                        const [startHour, startMinute] = lecture.startTime.split(':').map(Number);
                        const [endHour, endMinute] = lecture.endTime.split(':').map(Number);
                        
                        const startTime = new Date();
                        startTime.setHours(startHour, startMinute, 0, 0);
                        
                        const endTime = new Date();
                        endTime.setHours(endHour, endMinute, 0, 0);

                        if (now >= startTime && now <= endTime) {
                            messages.push(`Your ${lecture.courseCode} lecture is ongoing from ${formatTime(lecture.startTime)} to ${formatTime(lecture.endTime)} at ${lecture.venue}.`);
                        } else if (now < startTime) {
                            messages.push(`You have ${lecture.courseCode} today at ${formatTime(lecture.startTime)} with ${lecture.lecturer} at ${lecture.venue}.`);
                        }
                    });
                }

                if (messages.length > 0) {
                    notificationText.innerHTML = messages.join(' &nbsp; &nbsp; | &nbsp; &nbsp; ');
                    notificationBar.classList.remove('hidden');
                } else {
                    notificationBar.classList.add('hidden');
                }
            };

            lectureForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = lectureIdInput.value;
                const newLecture = {
                    day: document.getElementById('day').value,
                    courseCode: document.getElementById('course-code').value,
                    lecturer: document.getElementById('lecturer').value,
                    startTime: document.getElementById('start-time').value,
                    endTime: document.getElementById('end-time').value,
                    venue: document.getElementById('venue').value,
                };

                if (id) {
                    // Update existing lecture
                    const index = lectures.findIndex(l => l.id == id);
                    lectures[index] = { ...lectures[index], ...newLecture };
                    submitBtn.textContent = 'Add Lecture';
                    cancelEditBtn.classList.add('hidden');
                } else {
                    // Add new lecture
                    newLecture.id = Date.now();
                    lectures.push(newLecture);
                }

                lectureForm.reset();
                lectureIdInput.value = '';
                saveLectures();
                renderLectures();
            });

            lecturesContainer.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;

                const card = target.closest('.lecture-card');
                const lectureId = card.dataset.id;

                if (target.classList.contains('edit-btn')) {
                    const lectureToEdit = lectures.find(l => l.id == lectureId);
                    document.getElementById('lecture-id').value = lectureToEdit.id;
                    document.getElementById('day').value = lectureToEdit.day;
                    document.getElementById('course-code').value = lectureToEdit.courseCode;
                    document.getElementById('lecturer').value = lectureToEdit.lecturer;
                    document.getElementById('start-time').value = lectureToEdit.startTime;
                    document.getElementById('end-time').value = lectureToEdit.endTime;
                    document.getElementById('venue').value = lectureToEdit.venue;
                    
                    submitBtn.textContent = 'Update Lecture';
                    cancelEditBtn.classList.remove('hidden');
                    window.scrollTo(0, 0);
                }

                if (target.classList.contains('delete-btn')) {
                    lectures = lectures.filter(l => l.id != lectureId);
                    saveLectures();
                    renderLectures();
                }
            });

            cancelEditBtn.addEventListener('click', () => {
                lectureForm.reset();
                lectureIdInput.value = '';
                submitBtn.textContent = 'Add Lecture';
                cancelEditBtn.classList.add('hidden');
            });

            // Initial render and setup intervals
            renderLectures();
            setInterval(updateCountdowns, 1000);
            setInterval(updateNotifications, 60000); // Update notifications every minute
        });