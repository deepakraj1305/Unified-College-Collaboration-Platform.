const { createApp, ref, computed, nextTick, onMounted } = Vue;

    createApp({
      setup() {
        // App Navigation & Role State
        const currentView = ref('dashboard'); // 'landing' | 'dashboard'
        const activeTab = ref('dashboard');
        const sidebarOpen = ref(true);
        const isDark = ref(true);
        const openSearchModal = ref(false);
        const openQuickCreate = ref(false);
        const openNewTaskModal = ref(false);
        const openNewThreadModal = ref(false);
        const openUploadModal = ref(false);
        const quickTourModal = ref(false);
        const showNotifs = ref(false);
        const searchQuery = ref('');

        // Toast Notification System
        const toasts = ref([]);
        const triggerToast = (message, type = 'success', icon = null) => {
          const id = Date.now();
          toasts.value.push({ id, message, type, icon });
          setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id);
          }, 3500);
          nextTick(() => lucide.createIcons());
        };

        // User Personas & Role Switching
        const currentRole = ref('student');
        const personas = {
          student: {
            name: 'Alex Chen',
            roleTitle: 'Senior CSE • Class of 2025',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            email: 'alex.chen@campus.edu',
            collabScore: 1420
          },
          faculty: {
            name: 'Prof. Marcus Vance',
            roleTitle: 'Dean of Computing & Robotics',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
            email: 'm.vance@campus.edu',
            collabScore: 4890
          },
          admin: {
            name: 'Sarah Jenkins',
            roleTitle: 'Campus System Administrator',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
            email: 'admin.jenkins@campus.edu',
            collabScore: 9200
          }
        };

        const currentUser = computed(() => personas[currentRole.value]);

        const switchRole = (role) => {
          currentRole.value = role;
          if (role === 'faculty') activeTab.value = 'faculty_hub';
          else if (role === 'admin') activeTab.value = 'admin_hub';
          else activeTab.value = 'dashboard';
          triggerToast(`Switched active persona to ${personas[role].name} (${role})`, 'info');
        };

        const toggleTheme = () => {
          isDark.value = !isDark.value;
          document.documentElement.classList.toggle('dark', isDark.value);
          triggerToast(`Theme switched to ${isDark.value ? 'Dark' : 'Light'} Mode`, 'info');
        };

        const enterApp = () => {
          currentView.value = 'app';
          nextTick(() => lucide.createIcons());
        };

        // Navigation Config
        const navItems = [
          { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
          { id: 'projects', label: 'Projects & Tasks', icon: 'kanban', badge: 'Active' },
          { id: 'chat', label: 'Channels & Chat', icon: 'message-square', badge: '3' },
          { id: 'resources', label: 'Academic Vault', icon: 'file-check' },
          { id: 'discussions', label: 'Discussions & Forum', icon: 'messages-square' },
          { id: 'clubs', label: 'Clubs & Events', icon: 'calendar-check' },
          { id: 'calendar', label: 'Calendar', icon: 'calendar' },
          { id: 'profile', label: 'Profile & Karma', icon: 'award' }
        ];

        // Stats
        const userStats = ref({
          activeProjects: 4,
          pendingTasks: 7,
          attendanceRate: 98,
          collabRank: '#4'
        });

        // Dashboard Tasks & Kanban Tasks
        const dashboardTasks = ref([
          { id: 1, title: 'Calibrate LIDAR SLAM telemetry algorithm', assignee: 'Alex Chen', deadline: 'Tomorrow 5 PM', priority: 'high', done: false },
          { id: 2, title: 'Draft Distributed Consensus section for Midterm', assignee: 'Maya Lin', deadline: 'Oct 24', priority: 'medium', done: true },
          { id: 3, title: 'Submit Hardware Architecture Bill of Materials', assignee: 'Devon Price', deadline: 'Oct 26', priority: 'low', done: false }
        ]);

        const toggleTaskComplete = (task) => {
          task.done = !task.done;
          triggerToast(task.done ? 'Task marked complete! (+15 XP)' : 'Task marked pending', 'success');
        };

        const kanbanTasks = ref([
          { id: 101, column: 'todo', title: 'Setup PX4 Autopilot simulator bridge', desc: 'Connect SITL simulator with Dockerized ROS2 node network.', due: 'Oct 26', priority: 'high', assignee: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' },
          { id: 102, column: 'todo', title: 'Prepare IEEE Student Conference abstract', desc: 'Summarize our multi-agent collision avoidance benchmarks.', due: 'Nov 02', priority: 'low', assignee: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250' },
          { id: 103, column: 'inprogress', title: 'Optimize Jetson Orin edge neural network', desc: 'Quantize INT8 weights on YOLOv8 for low power on-drone inference.', due: 'Tomorrow', priority: 'high', assignee: 'Devon Price', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' },
          { id: 104, column: 'done', title: 'PCB Sensor Hat Schema Schematic', desc: 'Completed Altium files submitted to faculty fabrication lab.', due: 'Completed', priority: 'medium', assignee: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' }
        ]);

        const moveTask = (taskId, targetCol) => {
          const task = kanbanTasks.value.find(t => t.id === taskId);
          if (task) {
            task.column = targetCol;
            triggerToast(`Task moved to ${targetCol === 'done' ? 'Peer-Reviewed / Done' : targetCol}`, 'success');
          }
        };

        const newTask = ref({ title: '', desc: '', priority: 'high', assignee: 'Alex Chen' });
        const createTask = () => {
          kanbanTasks.value.push({
            id: Date.now(),
            column: 'todo',
            title: newTask.value.title,
            desc: newTask.value.desc,
            due: 'Due in 3 days',
            priority: newTask.value.priority,
            assignee: newTask.value.assignee,
            avatar: currentUser.value.avatar
          });
          openNewTaskModal.value = false;
          newTask.value = { title: '', desc: '', priority: 'high', assignee: 'Alex Chen' };
          triggerToast('New task added to Sprint Backlog!', 'success');
        };

        const priorityBadgeClass = (priority) => {
          if (priority === 'high') return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
          if (priority === 'medium') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
          return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        };

        // Chat Channels & Messages
        const channels = ref([
          { id: 1, name: 'campus-announcements', type: 'official', topic: 'Dean office notices & university-wide bulletins', membersCount: 1420 },
          { id: 2, name: 'hackathon-2025', type: 'official', topic: 'Annual Collegiate Hackathon logistics & teams', membersCount: 310 },
          { id: 3, name: 'cs402-capstone-drone', type: 'course', topic: 'Autonomous Drone Systems project stream', unread: true, membersCount: 18 },
          { id: 4, name: 'math204-linear-algebra', type: 'course', topic: 'Course Q&A & problem sets', membersCount: 94 },
          { id: 5, name: 'Prof. Marcus Vance', type: 'dm', topic: 'Dean & Capstone Advisor', membersCount: 2 }
        ]);
        const activeChannel = ref(channels.value[2]);

        const chatMessages = ref({
          3: [
            { id: 1, sender: 'Devon Price', text: 'Hey team, I just pushed the ROS2 sensor fusion package to GitHub.', time: '10:14 AM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', badge: 'Dev' },
            { id: 2, sender: 'Prof. Marcus Vance', text: 'Excellent progress team. Make sure to run integration tests before our lab review this Friday.', time: '10:20 AM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', badge: 'Faculty' },
            { id: 3, sender: 'Alex Chen', text: 'Will do professor! Running the SITL Gazebo simulation right now.', time: '10:22 AM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', badge: 'Lead' }
          ],
          1: [
            { id: 1, sender: 'Campus Registrar', text: 'Spring semester course enrollment schedules have been published.', time: '9:00 AM', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', badge: 'Admin' }
          ]
        });

        const currentMessages = computed(() => chatMessages.value[activeChannel.value.id] || [
          { id: 99, sender: 'UniSync Bot', text: `Welcome to #${activeChannel.value.name}. Be respectful and adhere to academic honor codes.`, time: 'Just now', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=250' }
        ]);

        const selectChannel = (channel) => {
          activeChannel.value = channel;
          if (channel.unread) channel.unread = false;
        };

        const newChatMessage = ref('');
        const sendChatMessage = () => {
          if (!newChatMessage.value.trim()) return;
          if (!chatMessages.value[activeChannel.value.id]) {
            chatMessages.value[activeChannel.value.id] = [];
          }
          chatMessages.value[activeChannel.value.id].push({
            id: Date.now(),
            sender: currentUser.value.name,
            text: newChatMessage.value,
            time: 'Just now',
            avatar: currentUser.value.avatar,
            badge: currentRole.value.toUpperCase()
          });
          newChatMessage.value = '';
          nextTick(() => lucide.createIcons());
        };

        // Academic Resources Vault
        const resourceCategories = ['All Courses', 'Computer Science', 'Mathematics', 'Mechanical & Robotics', 'Past Exam Papers'];
        const selectedResourceCategory = ref('All Courses');
        const sampleResources = ref([
          { id: 1, code: 'CS402', title: 'Distributed Microservices & Raft Algorithm Guide', category: 'Computer Science', description: 'Comprehensive walkthrough of leader election, heartbeat intervals, and failure recovery.', author: 'Alex Chen', downloads: 342, facultyVerified: true },
          { id: 2, code: 'MATH204', title: 'Singular Value Decomposition (SVD) Handout', category: 'Mathematics', description: 'Step-by-step vector matrix decompositions with verified worked examples.', author: 'Prof. Elena Rostova', downloads: 618, facultyVerified: true },
          { id: 3, code: 'CS301', title: 'Midterm Examination 2024 with Official Answer Key', category: 'Past Exam Papers', description: 'Includes faculty-graded solutions for B-Tree balancing and query optimization.', author: 'Prof. Marcus Vance', downloads: 890, facultyVerified: true },
          { id: 4, code: 'ROBO210', title: 'Forward & Inverse Kinematics Python Notebooks', category: 'Mechanical & Robotics', description: 'Jupyter notebook implementations of Denavit-Hartenberg parameter matrices.', author: 'Devon Price', downloads: 180, facultyVerified: false }
        ]);

        const filteredResources = computed(() => {
          if (selectedResourceCategory.value === 'All Courses') return sampleResources.value;
          return sampleResources.value.filter(r => r.category === selectedResourceCategory.value);
        });

        const newResource = ref({ title: '', code: '', category: 'Computer Science' });
        const uploadResource = () => {
          sampleResources.value.unshift({
            id: Date.now(),
            code: newResource.value.code,
            title: newResource.value.title,
            category: newResource.value.category,
            description: 'Uploaded by community peer. Submitted for faculty seal of approval.',
            author: currentUser.value.name,
            downloads: 0,
            facultyVerified: currentRole.value === 'faculty'
          });
          openUploadModal.value = false;
          currentUser.value.collabScore += 50;
          triggerToast('Resource uploaded successfully! You earned +50 XP Karma.', 'success');
        };

        const downloadResource = (res) => {
          res.downloads++;
          triggerToast(`Downloading ${res.title}. Verified MD5 checksum matched.`, 'success');
        };

        // Discussions Forum
        const sampleDiscussions = ref([
          { id: 1, tag: '#Hackathon', author: 'Maya Lin', time: '2 hours ago', title: 'Seeking 1 Backend + 1 Hardware Engineer for CalHacks 2025', snippet: 'Our project focuses on drone parcel delivery networks. We already have the airframe and PX4 hardware.', votes: 24, commentsCount: 9 },
          { id: 2, tag: '#Academics', author: 'Jordan Reed', time: '5 hours ago', title: 'Tips for handling concurrent transactions in CS301 project?', snippet: 'We are observing deadlock exceptions when running 50 parallel client threads under isolation level serializable.', votes: 16, commentsCount: 14 },
          { id: 3, tag: '#Research', author: 'Prof. Marcus Vance', time: '1 day ago', title: 'Undergraduate Research Assistant position available in Robotics Lab', snippet: 'Looking for students with experience in C++, ROS2, and Linux kernel drivers for Fall semester grant project.', votes: 58, commentsCount: 22 }
        ]);

        const upvoteThread = (thread) => {
          thread.votes++;
          triggerToast('Upvoted thread! Contributor earned Karma XP.', 'info');
        };

        const bookmarkThread = (thread) => {
          triggerToast('Thread saved to your academic bookmarks.', 'info');
        };

        const newThread = ref({ title: '', tag: '#Hackathon', content: '' });
        const createThread = () => {
          sampleDiscussions.value.unshift({
            id: Date.now(),
            tag: newThread.value.tag,
            author: currentUser.value.name,
            time: 'Just now',
            title: newThread.value.title,
            snippet: newThread.value.content,
            votes: 1,
            commentsCount: 0
          });
          openNewThreadModal.value = false;
          newThread.value = { title: '', tag: '#Hackathon', content: '' };
          triggerToast('Discussion posted to Campus Pulse!', 'success');
        };

        // Campus Clubs & Events
        const campusEvents = ref([
          { id: 1, name: 'Collegiate HackAI 2025: 36h Buildathon', club: 'Google Developer Student Club', date: 'OCT 28-29', venue: 'Campus Innovation Center Hub', desc: 'Over $15,000 in sponsor bounties, mentor office hours, and keynote speakers from top AI labs.', attendees: 240, registered: false, cover: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600' },
          { id: 2, name: 'Autonomous Robotics Fleet Field Demonstration', club: 'Robotics & Mechatronics Society', date: 'NOV 04', venue: 'South Quad Flight Cage', desc: 'Live outdoor tests of waypoint tracking, obstacle avoidance, and telemetry dashboards.', attendees: 88, registered: true, cover: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&q=80&w=600' },
          { id: 3, name: 'Dean Fireside Chat: Ethics of Frontier AI', club: 'Academic Affairs Council', date: 'NOV 12', venue: 'Auditorium 101 & Livestream', desc: 'Q&A session with visiting faculty and industry leaders regarding regulatory models.', attendees: 195, registered: false, cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=600' }
        ]);

        const campusClubs = [
          { name: 'Google Developer Student Club', icon: '💻', members: 420, lead: 'Maya Lin' },
          { name: 'Robotics & Autonomous Systems', icon: '🤖', members: 280, lead: 'Alex Chen' },
          { name: 'Collegiate FinTech & Algorithmic Trading', icon: '📈', members: 165, lead: 'Arjun Mehta' },
          { name: 'Campus Debating & Policy Union', icon: '⚖️', members: 110, lead: 'Claire Du' }
        ];

        const rsvpEvent = (event) => {
          event.registered = !event.registered;
          if (event.registered) {
            event.attendees++;
            triggerToast(`RSVP Confirmed for ${event.name}! Added to your calendar.`, 'success');
          } else {
            event.attendees--;
            triggerToast(`Registration cancelled for ${event.name}.`, 'info');
          }
        };

        // Deadlines & Notifications
        const upcomingDeadlines = [
          { id: 1, month: 'OCT', day: '26', title: 'Milestone 4 Architecture Schema', course: 'CS402 Capstone', countdown: '2 days remaining' },
          { id: 2, month: 'OCT', day: '30', title: 'Problem Set 4: Dynamic Programming', course: 'CS301 Algorithms', countdown: '6 days remaining' },
          { id: 3, month: 'NOV', day: '05', title: 'Midterm 2 Exam Review Session', course: 'MATH204 Linear Algebra', countdown: '12 days remaining' }
        ];

        const notifications = ref([
          { id: 1, title: 'Sprint Task Assigned', desc: 'Devon Price tagged you in PX4 Autopilot simulator bridge', time: '15m ago', unread: true },
          { id: 2, title: 'Resource Verified by Faculty', desc: 'Prof. Vance approved your Distributed Systems Cheatsheet', time: '1h ago', unread: true },
          { id: 3, title: 'Club Announcement', desc: 'GDSC posted details on HackAI keynote speaker list', time: '3h ago', unread: false }
        ]);
        const unreadNotifsCount = computed(() => notifications.value.filter(n => n.unread).length);
        const markAllNotifsRead = () => {
          notifications.value.forEach(n => n.unread = false);
          triggerToast('All notifications marked as read', 'info');
        };

        // Badges & Faculty Demo Records
        const earnedBadges = [
          { name: 'Sprint Finisher', icon: '⚡', reason: 'Closed 20+ verified Kanban tickets' },
          { name: 'Academic Benefactor', icon: '📚', reason: 'Shared 5+ faculty-verified class study notes' },
          { name: 'Peer Mentor', icon: '🤝', reason: 'Received 50+ upvotes on forum answers' },
          { name: 'Hackathon Contender', icon: '🏆', reason: 'Placed in top 3 collegiate buildathons' }
        ];

        const sampleFacultyTeams = [
          { name: 'Team Alpha: Autonomous Flight', lead: 'Alex Chen', members: 4, topic: 'ROS2 Gazebo Telemetry Integration', status: 'Pending Review' },
          { name: 'Team Beta: Edge Vision Pipeline', lead: 'Maya Lin', members: 3, topic: 'Jetson Orin TensorRT Acceleration', status: 'Approved' },
          { name: 'Team Gamma: Secure Microgrids', lead: 'Jason Wu', members: 4, topic: 'Blockchain Power Dispatch System', status: 'Revision Requested' }
        ];

        onMounted(() => {
          lucide.createIcons();
          // Keyboard shortcut listener for Ctrl+K
          window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
              e.preventDefault();
              openSearchModal.value = !openSearchModal.value;
            }
          });
        });

        return {
          currentView, activeTab, sidebarOpen, isDark, openSearchModal, openQuickCreate,
          openNewTaskModal, openNewThreadModal, openUploadModal, quickTourModal, showNotifs,
          searchQuery, toasts, triggerToast, currentRole, currentUser, switchRole, toggleTheme,
          enterApp, navItems, userStats, dashboardTasks, toggleTaskComplete, kanbanTasks,
          moveTask, newTask, createTask, priorityBadgeClass, channels, activeChannel,
          chatMessages, currentMessages, selectChannel, newChatMessage, sendChatMessage,
          resourceCategories, selectedResourceCategory, sampleResources, filteredResources,
          newResource, uploadResource, downloadResource, sampleDiscussions, upvoteThread,
          bookmarkThread, newThread, createThread, campusEvents, campusClubs, rsvpEvent,
          upcomingDeadlines, notifications, unreadNotifsCount, markAllNotifsRead,
          earnedBadges, sampleFacultyTeams
        };
      }
    }).mount('#app');
