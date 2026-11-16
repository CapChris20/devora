// Devora Activity Center: all behavior + GSAP motion from the reference page.
// Needs GSAP 3.12.5 loaded first (cdnjs). Sample data lives at the top of the IIFE.
(function () {
  var G = window.gsap || null;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var animate = !!G && !reduce;

  // ===== DATA (sample, mirrors the Firestore shapes) =====
  var PEOPLE = {
    jordan: { name: "Jordan Lee", major: "Computer Science", year: "Junior" },
    sam: { name: "Sam Rivera", major: "Software Engineering", year: "Sophomore" },
    priya: { name: "Priya Shah", major: "Computer Engineering", year: "Senior" },
    alex: { name: "Alex Kim", major: "Cybersecurity", year: "Freshman" },
    maya: { name: "Maya Hassan", major: "Data Science", year: "Junior" },
    omar: { name: "Omar Farouk", major: "Electrical Engineering", year: "Senior" },
    lena: { name: "Lena Park", major: "Computer Science", year: "Sophomore" }
  };
  var PEOPLE_ORDER = ["jordan", "sam", "priya", "alex", "maya", "omar", "lena"];

  // /events/{eventId}
  var EVENTS = [
    { id: "e1", week: 0, mon: "NOV", day: "18", dow: "WED", title: "CIS 310 Exam 2 Review Session", desc: "Walk through the practice exam with a tutor. Recording posted after for anyone who can't stay.", time: "4:00–5:30 PM", location: "Engineering Lab Building, Rm 1030", organizer: "CECS Learning Center", tags: ["academic"] },
    { id: "e2", week: 0, mon: "NOV", day: "19", dow: "THU", title: "Intro to Firebase Workshop", desc: "Build a tiny app with Firebase Auth and Firestore. Bring a laptop; no experience needed.", time: "6:00–7:30 PM", location: "Engineering Lab Building", organizer: "ACM Student Chapter", tags: ["workshop", "club"] },
    { id: "e3", week: 0, mon: "NOV", day: "20", dow: "FRI", title: "Commuter Coffee Hour", desc: "Free coffee before morning classes. Meet other commuters from your major.", time: "8:30–9:30 AM", location: "University Center", organizer: "CECS Student Council", tags: ["social"] },
    { id: "e4", week: 1, mon: "NOV", day: "24", dow: "TUE", title: "Resume & LinkedIn Night", desc: "Get your resume reviewed before winter internship deadlines.", time: "5:30–7:00 PM", location: "Online (Zoom)", organizer: "Society of Women Engineers", tags: ["workshop"] },
    { id: "e5", week: 2, mon: "DEC", day: "2", dow: "WED", title: "Game Night: Smash & Snacks", desc: "End-of-semester break. Bring a friend or come meet some new ones.", time: "7:00–9:00 PM", location: "University Center", organizer: "GDSC", tags: ["social", "club"] },
    { id: "e6", week: 2, mon: "DEC", day: "4", dow: "FRI", title: "Finals Study Jam", desc: "Quiet floor reserved for CECS students, with tutors walking around.", time: "1:00–6:00 PM", location: "Mardigian Library, 3rd floor", organizer: "CECS Learning Center", tags: ["academic"] }
  ];
  var WEEKS = [
    { title: "This week", range: "Nov 16–22" },
    { title: "Next week", range: "Nov 23–29", note: "Thanksgiving Day is Thu, Nov 26. Fewer events this week." },
    { title: "Finals push", range: "Nov 30–Dec 6" }
  ];
  var TAG_TONE = { academic: "g2", social: "g3", workshop: "g1", club: "g0" };
  var COURSES = ["CIS 310", "MATH 115", "CIS 350", "ECE 270", "CIS 450"];
  var PREF = { async: "Async", "in-person": "In person", both: "Async + in person" };

  var REPLIES = {
    jordan: ["Nice, I'll add you to the Discord tonight.", "We usually start around 6."],
    sam: ["Bet. I'll grab a table by the window.", "Bring the lab handout if you have it."],
    priya: ["Anytime! Good luck on the lab.", "Want to compare answers Friday?"],
    alex: ["Hey! Yeah, I'm in MATH 115 too.", "Want to join the problem set group?"],
    maya: ["Hi! Thanks for accepting.", "Are you in the async MATH 115 group?"],
    omar: ["Hey, thanks for connecting!", "Do you take the 94 in too?"],
    lena: ["Hey!", "See you in CIS 310."]
  };

  var state = {
    tab: "events",
    eventFilter: "all",
    saved: {},
    courseFilter: "All",
    groups: [
      { id: "g1", course: "CIS 310", topic: "Exam 2 prep: assembly and memory", desc: "Working through old exams and the practice set before Exam 2. Bring the parts you're stuck on.", members: ["jordan", "sam", "lena", "omar"], pref: "both", coord: "Discord server, #cis310-study" },
      { id: "g3", course: "CIS 350", topic: "Data structures lab buddies", desc: "Pair up on lab assignments Tuesday afternoons, then compare approaches.", members: ["priya", "jordan", "alex"], pref: "in-person", coord: "Tue 2 PM, engineering study lounge" },
      { id: "g2", course: "MATH 115", topic: "Weekly problem sets", desc: "Post your work by Thursday night, compare answers by Friday. Fully async.", members: ["alex", "maya", "priya"], pref: "async", coord: "GroupMe chat" },
      { id: "g4", course: "ECE 270", topic: "Circuits homework check", desc: "Quick answer checks and help on the tricky problems each week.", members: ["omar", "maya"], pref: "async", coord: "Discord group DM" },
      { id: "g5", course: "CIS 450", topic: "OS project teammates", desc: "Looking for 1 to 2 more people for the threading project.", members: ["sam", "jordan", "priya"], pref: "both", coord: "Slack workspace" }
    ],
    joined: { g3: true },
    requests: [
      { uid: "maya", note: "Also in MATH 115. \"I study async most nights, want to swap problem sets?\"" },
      { uid: "omar", note: "Also in ECE 270. \"Commuting from Canton, looking for a homework buddy.\"" }
    ],
    connections: ["jordan", "sam", "priya", "alex"],
    search: "",
    convoOrder: ["jordan", "sam", "priya"],
    active: "jordan",
    unread: { jordan: 2 },
    messages: {
      jordan: [
        { from: "jordan", text: "Hey! Saw you're in CIS 310 too.", time: "2:02 PM" },
        { from: "me", text: "Yeah, Tue/Thu section. Exam 2 is rough.", time: "2:09 PM" },
        { from: "jordan", text: "Want to join the CIS 310 group? We meet on Discord.", time: "2:14 PM" }
      ],
      sam: [
        { from: "me", text: "Still on for the lounge Wednesday?", time: "Yesterday" },
        { from: "sam", text: "See you Wednesday at noon", time: "Yesterday" }
      ],
      priya: [
        { from: "me", text: "Here are my lab notes from Tuesday.", time: "Nov 12" },
        { from: "priya", text: "Thanks for the lab notes!", time: "Nov 12" }
      ]
    },
    replyIndex: {},
    draft: "",
    form: { course: "CIS 310", topic: "", pref: "both", coord: "", desc: "" },
    modalOpen: false
  };

  // ===== HELPERS =====
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function initials(n) { return n.split(" ").slice(0, 2).map(function (w) { return w[0]; }).join(""); }
  function tone(uid) { var i = PEOPLE_ORDER.indexOf(uid); return "g" + ((i < 0 ? 0 : i) % 4); }
  function avatar(uid, cls) { var p = PEOPLE[uid]; return '<span class="avatar ' + (cls || "") + " " + tone(uid) + '" aria-hidden="true">' + initials(p.name) + "</span>"; }
  function nowTime() { var d = new Date(); var h = d.getHours(), m = d.getMinutes(); return ((h + 11) % 12 + 1) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM"); }
  function unreadTotal() { var t = 0; Object.keys(state.unread).forEach(function (k) { t += state.unread[k] || 0; }); return t; }
  function joinedCount() { return Object.keys(state.joined).filter(function (k) { return state.joined[k]; }).length; }
  function savedCount() { return Object.keys(state.saved).filter(function (k) { return state.saved[k]; }).length; }

  var ICON = {
    clock: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
    pin: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>',
    people: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path><path d="M16 4.5a3.5 3.5 0 0 1 0 7"></path><path d="M18 14a6.5 6.5 0 0 1 3.5 6"></path></svg>',
    chat: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path></svg>',
    search: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>',
    x: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>'
  };

  // ===== VIEWS =====
  function eventsView() {
    var filters = [["all", "All"], ["academic", "Academic"], ["social", "Social"], ["workshop", "Workshop"], ["club", "Club"]];
    var list = EVENTS.filter(function (e) { return state.eventFilter === "all" || e.tags.indexOf(state.eventFilter) !== -1; });
    var h = '<div class="head" data-in><div><p class="eyebrow"><span class="dot"></span>' + EVENTS.length + ' events through finals</p><h2>Upcoming CECS events</h2><p class="sub">Posted early, so you can plan around class and your commute. Save the ones you want on your week.</p></div><span class="sample">Sample data</span></div>';
    h += '<div class="chips" role="group" aria-label="Filter events" data-in>' + filters.map(function (f) {
      return '<button class="chip" data-action="event-filter" data-value="' + f[0] + '" aria-pressed="' + (state.eventFilter === f[0]) + '">' + f[1] + "</button>";
    }).join("") + "</div>";
    if (!list.length) {
      return h + '<div class="empty" data-in><p class="big">No ' + esc(state.eventFilter) + ' events yet</p><p class="small">New events show up here as soon as they are posted. Check back this week.</p></div>';
    }
    h += '<div class="weeks">';
    WEEKS.forEach(function (w, wi) {
      var inWeek = list.filter(function (e) { return e.week === wi; });
      if (!inWeek.length) return;
      h += '<section><div class="week-head" data-in><h3>' + w.title + '</h3><span class="label">' + w.range + "</span></div>";
      if (w.note) h += '<p class="week-note" data-in>' + w.note + "</p>";
      h += '<div class="tickets">' + inWeek.map(function (e) {
        var saved = !!state.saved[e.id];
        return '<article class="card lift ticket" data-in data-event="' + e.id + '">' +
          '<div class="date ' + TAG_TONE[e.tags[0]] + '"><span class="mon">' + e.mon + '</span><span class="day">' + e.day + '</span><span class="dow">' + e.dow + "</span></div>" +
          '<div class="body"><h4>' + e.title + "</h4><p>" + e.desc + '</p><div class="meta"><span>' + ICON.clock + e.time + "</span><span>" + ICON.pin + e.location + "</span><span>" + ICON.people + e.organizer + "</span></div></div>" +
          '<div class="stub"><div class="tags">' + e.tags.map(function (t) { return '<span class="tag ' + TAG_TONE[t] + '">' + t + "</span>"; }).join("") + "</div>" +
          '<button class="btn sm save' + (saved ? "" : " ghost") + '" data-action="save" data-value="' + e.id + '" aria-pressed="' + saved + '">' + (saved ? "Saved ✓" : "Save to my week") + "</button></div></article>";
      }).join("") + "</div></section>";
    });
    return h + "</div>";
  }

  function groupsView() {
    var list = state.groups.filter(function (g) { return state.courseFilter === "All" || g.course === state.courseFilter; });
    var h = '<div class="head" data-in><div><p class="eyebrow"><span class="dot"></span>' + state.groups.length + ' open groups</p><h2>Study groups by course</h2><p class="sub">Join one for your class or start your own. Async groups work around any schedule.</p></div><button class="btn" data-action="open-modal">+ New group</button></div>';
    h += '<div class="chips" role="group" aria-label="Filter by course" data-in>' + ["All"].concat(COURSES).map(function (c) {
      return '<button class="chip" data-action="course-filter" data-value="' + c + '" aria-pressed="' + (state.courseFilter === c) + '">' + c + "</button>";
    }).join("") + "</div>";
    if (!list.length) {
      return h + '<div class="empty" data-in><p class="big">No ' + esc(state.courseFilter) + ' groups yet</p><p class="small">Be the first. Classmates in that course will see it right away.</p><button class="btn" data-action="open-modal">Start a group</button></div>';
    }
    var busiest = list.slice().sort(function (a, b) { return b.members.length - a.members.length; })[0];
    return h + '<div class="groups">' + list.map(function (g) {
      var mine = !!state.joined[g.id];
      var members = g.members.slice(0, 4);
      var count = g.members.length + (mine ? 1 : 0);
      var featured = g === busiest && list.length > 2;
      var ci = Math.max(0, COURSES.indexOf(g.course)) % 4;
      return '<article class="card lift group' + (featured ? " featured" : "") + '" data-in data-group="' + g.id + '">' +
        (featured ? '<span class="sticker">Most active</span>' : "") +
        '<div class="row"><span class="tag g' + ci + '">' + esc(g.course) + '</span><span class="tag">' + PREF[g.pref] + "</span></div>" +
        "<h3>" + esc(g.topic) + "</h3><p>" + esc(g.desc) + '</p><p class="coord">' + ICON.chat + esc(g.coord) + "</p>" +
        '<div class="foot"><div class="members"><span class="stack">' + members.map(function (u) { return avatar(u, "xs"); }).join("") + (mine ? '<span class="avatar xs g1" aria-hidden="true" data-me>YU</span>' : "") + '</span><span><span class="n" data-n>' + count + '</span> <span class="label">' + (count === 1 ? "member" : "members") + "</span></span></div>" +
        '<button class="btn sm' + (mine ? " ghost" : "") + '" data-action="join" data-value="' + g.id + '">' + (mine ? "Joined ✓ · Leave" : "Join group") + "</button></div></article>";
    }).join("") + "</div>";
  }

  function connectionsView() {
    var h = '<div class="head" data-in><div><p class="eyebrow"><span class="dot"></span>Stay connected across semesters</p><h2>Your people</h2><p class="sub">Accept requests from classmates, then message them any time, even after the semester ends.</p></div><span class="sample">Sample data</span></div>';
    h += '<div class="conn"><section aria-label="Requests" data-in><div class="week-head"><h3>Requests</h3><span class="label">' + state.requests.length + " pending</span></div>";
    if (!state.requests.length) {
      h += '<div class="empty"><p class="big">You\'re all caught up</p><p class="small">New connection requests will land here.</p></div>';
    } else {
      var top = state.requests[0], p = PEOPLE[top.uid];
      h += '<div class="deck">' + (state.requests.length > 2 ? '<div class="ghost-card l2" aria-hidden="true"></div>' : "") + (state.requests.length > 1 ? '<div class="ghost-card l1" aria-hidden="true"></div>' : "") +
        '<article class="card request" id="request-card"><div class="who">' + avatar(top.uid, "lg") + '<div style="min-width:0"><p class="name">' + p.name + '</p><p class="label" style="margin:2px 0 0">' + p.major + " · " + p.year + "</p></div></div>" +
        '<p class="note">' + esc(top.note) + '</p><div class="acts"><button class="btn" data-action="accept">Accept</button><button class="btn ghost" data-action="decline">Decline</button></div></article></div>';
      if (state.requests.length > 1) h += '<p class="deck-count">' + (state.requests.length - 1) + " more waiting behind this one</p>";
    }
    h += '</section><section aria-label="Connections" data-in><div class="week-head"><h3>Connections</h3><span class="label">' + state.connections.length + " people</span></div>";
    h += '<label class="search" for="people-search">' + ICON.search + '<input id="people-search" placeholder="Search by name or major" value="' + esc(state.search) + '" autocomplete="off"></label>';
    var q = state.search.trim().toLowerCase();
    var people = state.connections.filter(function (u) { var p = PEOPLE[u]; return !q || (p.name + " " + p.major).toLowerCase().indexOf(q) !== -1; });
    if (!state.connections.length) {
      h += '<div class="empty"><p class="big">No connections yet</p><p class="small">Find classmates by major and year on the Discovery Grid.</p></div>';
    } else if (!people.length) {
      h += '<div class="empty"><p class="big">No one matches "' + esc(state.search) + '"</p><p class="small">Try a first name or a major.</p></div>';
    } else {
      h += '<div class="people" id="people">' + people.map(function (u) {
        var p = PEOPLE[u];
        return '<article class="card lift person" data-person="' + u + '">' + avatar(u, "lg") + '<div class="meta2"><p class="nm">' + p.name + '</p><p class="mj">' + p.major + '</p><p class="label" style="margin:2px 0 0">' + p.year + '</p></div><button class="btn sm ghost" data-action="message" data-value="' + u + '">Message</button></article>';
      }).join("") + "</div>";
    }
    return h + "</section></div>";
  }

  function messagingView() {
    var h = '<div class="head" data-in><div><p class="eyebrow"><span class="dot"></span>1-on-1 with your connections</p><h2>Messages</h2><p class="sub">Coordinate a study session without the cold approach. Only people you\'re connected with can message you.</p></div></div>';
    if (!state.convoOrder.length) {
      return h + '<div class="empty" data-in><p class="big">No conversations yet</p><p class="small">You can message anyone you\'re connected with.</p><button class="btn" data-action="goto" data-value="connections">Go to Connections</button></div>';
    }
    var a = PEOPLE[state.active];
    h += '<div class="card dm" data-in><div class="inbox"><div class="inbox-head"><h3>Inbox</h3><span class="label">' + state.convoOrder.length + ' chats</span></div><div class="convos" id="convos">' +
      state.convoOrder.map(function (u) {
        var msgs = state.messages[u] || [], last = msgs[msgs.length - 1], un = state.unread[u] || 0;
        return '<button class="convo" data-action="open-convo" data-value="' + u + '" aria-current="' + (u === state.active) + '">' + avatar(u) +
          '<span class="info"><span class="top"><span class="nm">' + PEOPLE[u].name + '</span><span class="tm">' + (last ? last.time : "New") + '</span></span><span class="pv' + (un ? " unread" : "") + '">' + (last ? esc(last.text) : "Say hi to start the conversation") + "</span></span>" +
          (un ? '<span class="badge">' + un + "</span>" : "") + "</button>";
      }).join("") + "</div></div>";
    h += '<div class="chat"><div class="chat-head">' + avatar(state.active) + '<div class="who"><b>' + a.name + "</b><span>" + a.major + " · " + a.year + '</span></div></div><ol class="thread" id="thread">' +
      (state.messages[state.active] || []).map(function (m) { return bubble(m); }).join("") + "</ol>" +
      '<div class="quick" aria-label="Quick replies">' + ["Sounds good!", "What time works?", "I'm in", "Can you share the notes?"].map(function (q) { return '<button class="chip" data-action="quick" data-value="' + esc(q) + '">' + q + "</button>"; }).join("") + "</div>" +
      '<form class="composer" id="composer"><label for="draft" style="position:absolute;left:-9999px">Message ' + a.name + '</label><input id="draft" autocomplete="off" placeholder="Message ' + a.name.split(" ")[0] + '…" value="' + esc(state.draft) + '"><button class="btn" type="submit">Send</button></form></div></div>';
    return h;
  }

  function bubble(m) {
    return '<li class="bubble' + (m.from === "me" ? " mine" : "") + '">' + esc(m.text) + '<span class="t">' + m.time + "</span></li>";
  }

  var VIEWS = { "events": eventsView, "study-groups": groupsView, "connections": connectionsView, "messaging": messagingView };

  // ===== RENDERING + MOTION =====
  var panel = $("#panel");

  function renderPanel() {
    panel.innerHTML = VIEWS[state.tab]();
    var t = $("#thread"); if (t) t.scrollTop = t.scrollHeight;
  }

  function animateIn() {
    if (!animate) return;
    var items = $$("[data-in]", panel);
    G.fromTo(items, { y: 34, autoAlpha: 0, rotation: function (i) { return i % 2 ? 1.2 : -1.2; } },
      { y: 0, autoAlpha: 1, rotation: 0, duration: 0.6, ease: "back.out(1.5)", stagger: 0.055, clearProps: "transform,opacity,visibility" });
  }

  function movePill(instant) {
    var btn = $('.tab[data-tab="' + state.tab + '"]'), pill = $("#pill");
    if (!btn) return;
    var x = btn.offsetLeft, w = btn.offsetWidth;
    if (animate && !instant) G.to(pill, { x: x, width: w, duration: 0.55, ease: "back.out(1.7)" });
    else if (G) G.set(pill, { x: x, width: w });
    else { pill.style.transform = "translateX(" + x + "px)"; pill.style.width = w + "px"; }
    $$(".tab").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === state.tab ? "true" : "false"); });
    var tabs = $("#tabs");
    if (tabs.scrollWidth > tabs.clientWidth) tabs.scrollTo({ left: Math.max(0, x - 24), behavior: animate ? "smooth" : "auto" });
  }

  function setTab(tab, opts) {
    if (!VIEWS[tab]) tab = "events";
    opts = opts || {};
    var changed = tab !== state.tab;
    state.tab = tab;
    if (tab === "messaging") { state.unread[state.active] = 0; updateCounts(); }
    movePill(opts.instant);
    if (location.hash.slice(1) !== tab) { try { history.replaceState(null, "", "#" + tab); } catch (e) { location.hash = tab; } }
    if (!changed && !opts.force) return;
    if (opts.scroll) {
      var bar = $(".tabbar"); var top = bar.getBoundingClientRect().top + window.scrollY - 2;
      if (window.scrollY > top || opts.scroll === "always") window.scrollTo({ top: top, behavior: animate ? "smooth" : "auto" });
    }
    if (animate && !opts.instant) {
      G.to(panel, { autoAlpha: 0, y: 10, duration: 0.16, ease: "power2.in", onComplete: function () {
        renderPanel(); G.set(panel, { autoAlpha: 1, y: 0 }); animateIn();
      } });
    } else { renderPanel(); animateIn(); }
  }

  // Count-up numbers in the bento + tab badges
  var shown = {};
  function updateCounts() {
    var values = { requests: state.requests.length, unread: unreadTotal(), groups: joinedCount(), saved: savedCount() };
    Object.keys(values).forEach(function (k) {
      var v = values[k];
      $$('[data-count="' + k + '"]').forEach(function (el) {
        if (el.classList.contains("count")) { el.textContent = v; el.hidden = v === 0; return; }
        var from = shown[k] == null ? v : shown[k];
        if (animate && from !== v) {
          var o = { n: from };
          G.to(o, { n: v, duration: 0.6, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.n); } });
          G.fromTo(el.closest(".tile"), { rotation: -2 }, { rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)", clearProps: "transform" });
        } else el.textContent = v;
      });
      shown[k] = v;
    });
  }

  function pop(el) {
    if (!animate || !el) return;
    G.fromTo(el, { scale: 0.86 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.1, 0.45)", clearProps: "transform" });
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg; t.hidden = false;
    if (animate) G.fromTo(t, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      if (animate) G.to(t, { y: 30, autoAlpha: 0, duration: 0.25, onComplete: function () { t.hidden = true; } });
      else t.hidden = true;
    }, 2200);
  }

  // ===== MODAL =====
  function openModal() {
    state.modalOpen = true;
    if (state.courseFilter !== "All") state.form.course = state.courseFilter;
    var f = state.form;
    $("#modal-root").innerHTML = '<div class="backdrop" id="backdrop"><form class="modal" id="group-form" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal-top"><h2 id="modal-title">New study group</h2><button type="button" class="x" data-action="close-modal" aria-label="Close">' + ICON.x + "</button></div>" +
      '<label class="field" for="f-course"><span class="label">Course</span><select id="f-course">' + COURSES.map(function (c) { return "<option" + (c === f.course ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></label>" +
      '<label class="field" for="f-topic"><span class="label">Topic</span><input id="f-topic" required placeholder="Exam 2 prep, lab help, weekly problem sets…" value="' + esc(f.topic) + '"></label>' +
      '<div class="field"><span class="label">Meeting preference</span><div class="seg" role="group" aria-label="Meeting preference">' + [["async", "Async"], ["in-person", "In person"], ["both", "Both"]].map(function (p) { return '<button type="button" class="chip" data-action="pref" data-value="' + p[0] + '" aria-pressed="' + (f.pref === p[0]) + '">' + p[1] + "</button>"; }).join("") + "</div></div>" +
      '<label class="field" for="f-coord"><span class="label">How you\'ll coordinate</span><input id="f-coord" placeholder="Discord server, GroupMe, group chat…" value="' + esc(f.coord) + '"></label>' +
      '<label class="field" for="f-desc"><span class="label">Description</span><textarea id="f-desc" rows="3" placeholder="What you\'ll work on and who it\'s for">' + esc(f.desc) + "</textarea></label>" +
      '<div class="modal-acts"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn">Create group</button></div></form></div>';
    if (animate) {
      G.fromTo("#backdrop", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      G.fromTo(".modal", { y: 40, scale: 0.92, rotation: -2 }, { y: 0, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.6)" });
    }
    setTimeout(function () { var t = $("#f-topic"); if (t) t.focus(); }, 60);
  }
  function closeModal() {
    if (!state.modalOpen) return;
    state.modalOpen = false;
    var done = function () { $("#modal-root").innerHTML = ""; };
    if (animate) { G.to(".modal", { y: 30, scale: 0.95, duration: 0.18, ease: "power2.in" }); G.to("#backdrop", { autoAlpha: 0, duration: 0.2, onComplete: done }); }
    else done();
  }
  function readForm() {
    state.form.course = $("#f-course").value;
    state.form.topic = $("#f-topic").value;
    state.form.coord = $("#f-coord").value;
    state.form.desc = $("#f-desc").value;
  }

  // ===== ACTIONS =====
  function joinGroup(id, btn) {
    state.joined[id] = !state.joined[id];
    var g = state.groups.find(function (x) { return x.id === id; });
    var wasJoin = state.joined[id];
    renderPanel(); updateCounts();
    var card = $('[data-group="' + id + '"]');
    pop($("[data-n]", card));
    if (wasJoin && animate) G.from($("[data-me]", card), { scale: 0, rotation: -90, duration: 0.5, ease: "back.out(2.5)" });
    toast(wasJoin ? "Joined " + g.course + " · " + g.topic : "Left " + g.course + " group");
  }

  function decideRequest(accept) {
    var card = $("#request-card"); if (!card) return;
    var req = state.requests[0];
    var finish = function () {
      state.requests.shift();
      if (accept && state.connections.indexOf(req.uid) === -1) state.connections.unshift(req.uid);
      state.search = "";
      renderPanel(); updateCounts();
      if (accept) {
        var el = $('[data-person="' + req.uid + '"]');
        if (animate && el) G.fromTo(el, { scale: 0.4, autoAlpha: 0, rotation: -6 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.65, ease: "back.out(2)", clearProps: "transform,opacity,visibility" });
        if (el) { el.style.background = "var(--brand)"; setTimeout(function () { el.style.transition = "background .8s"; el.style.background = ""; }, 900); }
      }
      var next = $("#request-card");
      if (animate && next) G.from(next, { y: 18, scale: 0.97, duration: 0.4, ease: "back.out(1.6)" });
      toast(accept ? PEOPLE[req.uid].name + " is now a connection" : "Request declined");
    };
    if (animate) G.to(card, { x: accept ? 220 : -220, y: -24, rotation: accept ? 12 : -12, autoAlpha: 0, duration: 0.45, ease: "power2.in", onComplete: finish });
    else finish();
  }

  function openChat(uid) {
    if (state.convoOrder.indexOf(uid) === -1) { state.convoOrder.unshift(uid); state.messages[uid] = state.messages[uid] || []; }
    state.active = uid; state.unread[uid] = 0;
    setTab("messaging", { force: true, scroll: true });
    updateCounts();
  }

  function sendMessage(text) {
    text = String(text || "").trim();
    if (!text) return;
    var uid = state.active;
    state.messages[uid].push({ from: "me", text: text, time: nowTime() });
    state.convoOrder = [uid].concat(state.convoOrder.filter(function (u) { return u !== uid; }));
    state.draft = "";
    renderPanel();
    var thread = $("#thread"), last = thread.lastElementChild;
    if (animate) G.from(last, { y: 20, scale: 0.85, autoAlpha: 0, transformOrigin: "100% 100%", duration: 0.45, ease: "back.out(2)" });
    var input = $("#draft"); if (input) input.focus();
    // Fake reply so the thread feels alive (real version: onSnapshot on /conversations/{id}/messages)
    var typing = document.createElement("li");
    typing.className = "typing"; typing.setAttribute("aria-label", PEOPLE[uid].name + " is typing");
    typing.innerHTML = "<i></i><i></i><i></i>";
    setTimeout(function () {
      if (state.tab !== "messaging" || state.active !== uid) return;
      var th = $("#thread"); if (!th) return;
      th.appendChild(typing); th.scrollTop = th.scrollHeight;
      if (animate) G.to($$("i", typing), { y: -5, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.12 });
    }, 450);
    setTimeout(function () {
      if (G) G.killTweensOf($$("i", typing));
      var pool = REPLIES[uid] || ["Sounds good!"];
      var i = state.replyIndex[uid] || 0;
      state.messages[uid].push({ from: uid, text: pool[i % pool.length], time: nowTime() });
      state.replyIndex[uid] = i + 1;
      if (state.tab !== "messaging") { state.unread[uid] = (state.unread[uid] || 0) + 1; updateCounts(); return; }
      if (state.active !== uid) { state.unread[uid] = (state.unread[uid] || 0) + 1; updateCounts(); renderPanel(); return; }
      var keep = $("#draft") ? $("#draft").value : "";
      state.draft = keep;
      renderPanel();
      var th = $("#thread"), lst = th.lastElementChild;
      if (animate) G.from(lst, { y: 20, scale: 0.85, autoAlpha: 0, transformOrigin: "0% 100%", duration: 0.45, ease: "back.out(2)" });
      var d = $("#draft"); if (d && document.activeElement === document.body) d.focus();
    }, 1700);
  }

  document.addEventListener("click", function (e) {
    var go = e.target.closest("[data-go]");
    if (go) { setTab(go.dataset.go, { scroll: "always" }); return; }
    var tab = e.target.closest(".tab");
    if (tab) { setTab(tab.dataset.tab); return; }
    if (e.target.id === "backdrop") { closeModal(); return; }
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var a = el.dataset.action, v = el.dataset.value;
    if (a === "event-filter") { state.eventFilter = v; renderPanel(); animateIn(); }
    else if (a === "course-filter") { state.courseFilter = v; renderPanel(); animateIn(); }
    else if (a === "save") {
      state.saved[v] = !state.saved[v]; renderPanel(); updateCounts();
      pop($('[data-event="' + v + '"] .save'));
      var ev = EVENTS.find(function (x) { return x.id === v; });
      toast(state.saved[v] ? "Saved " + ev.title + " to your week" : "Removed from your week");
    }
    else if (a === "join") joinGroup(v, el);
    else if (a === "open-modal") openModal();
    else if (a === "close-modal") closeModal();
    else if (a === "pref") { readForm(); state.form.pref = v; $$('[data-action="pref"]').forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.value === v); }); pop(el); }
    else if (a === "accept") decideRequest(true);
    else if (a === "decline") decideRequest(false);
    else if (a === "message") openChat(v);
    else if (a === "open-convo") {
      state.draft = $("#draft") ? $("#draft").value : state.draft;
      state.active = v; state.unread[v] = 0; renderPanel(); updateCounts();
      if (animate) G.from($$("#thread .bubble"), { y: 14, autoAlpha: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" });
    }
    else if (a === "quick") sendMessage(v);
    else if (a === "goto") setTab(v);
  });

  document.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "composer") { sendMessage($("#draft").value); return; }
    if (e.target.id === "group-form") {
      readForm();
      var f = state.form;
      if (!f.topic.trim()) { pop($("#f-topic")); $("#f-topic").focus(); return; }
      var id = "new" + Date.now();
      state.groups.unshift({ id: id, course: f.course, topic: f.topic.trim(), desc: f.desc.trim() || "New group. Say hi and share what you're working on.", members: [], pref: f.pref, coord: f.coord.trim() || "Coordination details coming soon" });
      state.joined[id] = true;
      state.courseFilter = "All";
      state.form = { course: f.course, topic: "", pref: "both", coord: "", desc: "" };
      closeModal(); renderPanel(); updateCounts();
      var card = $('[data-group="' + id + '"]');
      if (animate && card) G.fromTo(card, { scale: 0.6, rotation: -4, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.7, ease: "back.out(1.8)", clearProps: "transform,opacity,visibility" });
      toast("Created your " + f.course + " group");
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target.id === "people-search") {
      state.search = e.target.value;
      var pos = e.target.selectionStart;
      renderPanel();
      var s = $("#people-search"); s.focus(); try { s.setSelectionRange(pos, pos); } catch (er) {}
    }
    if (e.target.id === "draft") state.draft = e.target.value;
  });

  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && state.modalOpen) closeModal(); });
  window.addEventListener("hashchange", function () { var h = location.hash.slice(1); if (VIEWS[h] && h !== state.tab) setTab(h, { scroll: true }); });
  window.addEventListener("resize", function () { movePill(true); });

  // ===== TICKER =====
  var tickerText = EVENTS.map(function (e) { return '<span class="ticker-item"><b>' + e.mon + " " + e.day + "</b>" + e.title + "</span>"; }).join("");
  $("#ticker").innerHTML = tickerText + tickerText;

  // ===== BOOT =====
  // Split the title into letters for the intro
  $$("#title .line").forEach(function (line) {
    line.innerHTML = line.textContent.split("").map(function (c) { return '<span class="ch">' + c + "</span>"; }).join("");
  });
  var start = location.hash.slice(1);
  state.tab = VIEWS[start] ? start : "events";
  renderPanel();
  updateCounts();
  movePill(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { movePill(true); });

  if (animate) {
    var tl = G.timeline({ defaults: { ease: "power3.out" } });
    tl.from("#title .ch", { yPercent: 110, rotation: 8, duration: 0.7, stagger: 0.035 })
      .from("#strip", { scaleX: 0, duration: 0.6, ease: "expo.out" }, "-=0.35")
      .from(".hero .eyebrow, #lede", { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, "-=0.45")
      .from(".tile", { y: 50, rotation: function (i) { return i % 2 ? 3 : -3; }, autoAlpha: 0, duration: 0.7, ease: "back.out(1.5)", stagger: 0.07, clearProps: "transform,opacity,visibility" }, "-=0.55")
      .from(".tab", { y: 18, autoAlpha: 0, duration: 0.45, stagger: 0.05, clearProps: "transform,opacity,visibility" }, "-=0.45")
      .from("#pill", { scaleX: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.2")
      .add(function () { animateIn(); }, "-=0.35");
    G.to("#ticker", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
    // Bento numbers count up on load
    $$(".tile .v").forEach(function (el) {
      var target = +el.textContent, o = { n: 0 };
      G.to(o, { n: target, duration: 1.1, delay: 0.7, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.n); } });
    });
  }
})();
