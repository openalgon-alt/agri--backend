import editorialBoardMembers from '../src/routes/editorial-board-members.js';
import editorialSections from '../src/routes/editorial-sections.js';
import issues from '../src/routes/issues.js';
import mockQuestions from '../src/routes/mock-questions.js';
import mockTests from '../src/routes/mock-tests.js';
import products from '../src/routes/products.js';
import saveAnswer from '../src/routes/save-answer.js';
import saveProfile from '../src/routes/save-profile.js';
import startTest from '../src/routes/start-test.js';
import submitTest from '../src/routes/submit-test.js';

import adminAllPurchases from '../src/routes/admin/all-purchases.js';
import adminDeleteMockQuestion from '../src/routes/admin/delete-mock-question.js';
import adminDeleteMockTest from '../src/routes/admin/delete-mock-test.js';
import adminSaveMockQuestion from '../src/routes/admin/save-mock-question.js';
import adminSaveMockTest from '../src/routes/admin/save-mock-test.js';
import adminStudents from '../src/routes/admin/students.js';
import adminUsers from '../src/routes/admin/users.js';

export default async function handler(req, res) {
  // CORS configuration is handled globally by vercel.json.
  // Do NOT add res.setHeader('Access-Control-Allow-Origin', '*') here or it will duplicate into "*, *" and break preflight!

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine the route requested. 
  // Under Vercel rewrites: source=/api/(.*), destination=/api/index.js
  // req.url maintains the original path: e.g. /api/admin/users
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api\//, '').replace(/\/$/, ''); // maps "/api/foo" to "foo"

  console.log(`[Router] Routing request for path: ${path}`);

  switch (path) {
    // Public routes
    case 'editorial-board-members': return editorialBoardMembers(req, res);
    case 'editorial-sections': return editorialSections(req, res);
    case 'issues': return issues(req, res);
    case 'mock-questions': return mockQuestions(req, res);
    case 'mock-tests': return mockTests(req, res);
    case 'products': return products(req, res);
    case 'save-answer': return saveAnswer(req, res);
    case 'save-profile': return saveProfile(req, res);
    case 'start-test': return startTest(req, res);
    case 'submit-test': return submitTest(req, res);

    // Admin routes
    case 'admin/all-purchases': return adminAllPurchases(req, res);
    case 'admin/delete-mock-question': return adminDeleteMockQuestion(req, res);
    case 'admin/delete-mock-test': return adminDeleteMockTest(req, res);
    case 'admin/save-mock-question': return adminSaveMockQuestion(req, res);
    case 'admin/save-mock-test': return adminSaveMockTest(req, res);
    case 'admin/students': return adminStudents(req, res);
    case 'admin/users': return adminUsers(req, res);

    default:
      if (path === 'index' || path === '') {
         return res.status(200).json({ status: "ok", message: "Vercel Unified API Router Online" });
      }
      return res.status(404).json({ error: `Route /api/${path} not found in router` });
  }
}
