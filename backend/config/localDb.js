const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../data/local_db.json');

const SEED_TASKS = [
  {
    "title": "Draft Social Media Campaign Plan",
    "phase": "Pre Release Campaign",
    "priority": "High",
    "status": "Completed",
    "dueDate": "2026-06-01T00:00:00.000Z",
    "details": "Define channels, posting schedule, and key messaging."
  },
  {
    "title": "Identify & Reach Out to Influencers",
    "phase": "Pre Release Campaign",
    "priority": "Medium",
    "status": "Completed",
    "dueDate": "2026-06-05T00:00:00.000Z",
    "details": "Contact local cinema bloggers and social influencers."
  },
  {
    "title": "Trailer Launch Press Release",
    "phase": "Trailer Drop Day",
    "priority": "Critical",
    "status": "Completed",
    "dueDate": "2026-06-10T00:00:00.000Z",
    "details": "Send the press release to entertainment news outlets."
  },
  {
    "title": "Design Trailer Launch Posters",
    "phase": "Trailer Drop Day",
    "priority": "High",
    "status": "In Progress",
    "dueDate": "2026-06-12T00:00:00.000Z",
    "details": "Create high-res graphics for Facebook and Instagram."
  },
  {
    "title": "Publish Trailer on YouTube & TikTok",
    "phase": "Trailer Release",
    "priority": "Critical",
    "status": "Completed",
    "dueDate": "2026-06-14T00:00:00.000Z",
    "details": "Upload final trailer cut and optimize description/tags."
  },
  {
    "title": "Paid Ad Campaigns (Meta & TikTok)",
    "phase": "Trailer Release",
    "priority": "High",
    "status": "In Progress",
    "dueDate": "2026-06-18T00:00:00.000Z",
    "details": "Launch sponsored trailer views campaigns."
  },
  {
    "title": "Cinema Banner Installation",
    "phase": "Cinema Launch",
    "priority": "Medium",
    "status": "Pending",
    "dueDate": "2026-06-25T00:00:00.000Z",
    "details": "Coordinate banner placements at major theatres."
  },
  {
    "title": "Premier Night Guest List",
    "phase": "Cinema Launch",
    "priority": "High",
    "status": "Pending",
    "dueDate": "2026-06-26T00:00:00.000Z",
    "details": "Compile list of invitees, cast, and crew members."
  },
  {
    "title": "Post-Release Reviews Compilation",
    "phase": "Post Release",
    "priority": "Low",
    "status": "Pending",
    "dueDate": "2026-07-02T00:00:00.000Z",
    "details": "Gather audience reaction videos and critic reviews."
  }
];

// Ensure directory and file exist
function initLocalDb() {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    // Generate unique IDs for the seed tasks
    const tasksWithIds = SEED_TASKS.map(task => ({
      _id: Math.random().toString(36).substr(2, 9),
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    fs.writeFileSync(FILE_PATH, JSON.stringify({ tasks: tasksWithIds, users: [], kpis: [] }, null, 2));
  }
}

class LocalJSONModel {
  constructor(collectionName) {
    this.collectionName = collectionName; // 'tasks', 'users', or 'kpis'
    initLocalDb();
  }

  read() {
    initLocalDb();
    try {
      const data = fs.readFileSync(FILE_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Local DB read failed, resetting structure", e);
      return { tasks: [], users: [], kpis: [] };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Failed to write to local db file:", e);
    }
  }

  find() {
    const db = this.read();
    const items = db[this.collectionName] || [];
    let result = [...items];
    
    const query = {
      sort(sorter) {
        if (sorter && sorter.createdAt === -1) {
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return this;
      },
      then(resolve, reject) {
        resolve(result);
      }
    };
    return query;
  }

  async create(body) {
    const db = this.read();
    const newItem = {
      _id: Math.random().toString(36).substr(2, 9),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!db[this.collectionName]) db[this.collectionName] = [];
    db[this.collectionName].push(newItem);
    this.write(db);
    return newItem;
  }

  async findByIdAndUpdate(id, body, options) {
    const db = this.read();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    items[index] = {
      ...items[index],
      ...body,
      updatedAt: new Date().toISOString()
    };
    this.write(db);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const db = this.read();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = items[index];
    db[this.collectionName] = items.filter(item => item._id !== id);
    this.write(db);
    return deleted;
  }
}

module.exports = LocalJSONModel;
