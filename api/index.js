import editorialBoardMembers from '../src/routes/editorial-board-members.js';
import editorialSections from '../src/routes/editorial-sections.js';
import getUserSubmissions from '../src/routes/get-user-submissions.js';
import issues from '../src/routes/issues.js';
import mockQuestions from '../src/routes/mock-questions.js';
import mockTests from '../src/routes/mock-tests.js';
import products from '../src/routes/products.js';
import saveAnswer from '../src/routes/save-answer.js';
import saveProfile from '../src/routes/save-profile.js';
import startTest from '../src/routes/start-test.js';
import submitTest from '../src/routes/submit-test.js';
import userPurchases from '../src/routes/user-purchases.js';
import userPerformance from '../src/routes/user-performance.js';

import adminAllPurchases from '../src/routes/admin/all-purchases.js';
import adminDeleteMockQuestion from '../src/routes/admin/delete-mock-question.js';
import adminDeleteMockTest from '../src/routes/admin/delete-mock-test.js';
import adminGrantAccess from '../src/routes/admin/grant-access.js';
import adminLookupUser from '../src/routes/admin/lookup-user.js';
import adminRevokeAccess from '../src/routes/admin/revoke-access.js';
import adminSaveMockQuestion from '../src/routes/admin/save-mock-question.js';
import adminSaveMockTest from '../src/routes/admin/save-mock-test.js';
import adminStudents from '../src/routes/admin/students.js';
import adminStudentHistory from '../src/routes/admin/student-history.js';
import adminUsers from '../src/routes/admin/users.js';

import offlineCoaching from '../src/routes/offline-coaching.js';
import adminSaveOfflineCoaching from '../src/routes/admin/save-offline-coaching.js';
import adminDeleteOfflineCoaching from '../src/routes/admin/delete-offline-coaching.js';

import aoAaoSignup from '../src/routes/ao-aao-signup.js';
import aoAaoLogin from '../src/routes/ao-aao-login.js';
import adminAoAaoUsers from '../src/routes/admin/ao-aao-users.js';

export default async function handler(req, res) {
  // Always set CORS headers in the response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  let path = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');

  // Support body action POST requests (from the frontend `/api` POST wrapper)
  if (path === '' && req.method === 'POST' && req.body && req.body.action) {
    const action = req.body.action;
    const payload = req.body.payload || {};
    
    console.log(`[Router] Intercepted body action: ${action} with payload keys: ${Object.keys(payload).join(', ')}`);
    
    // Rewrite req.body to be the payload so the handlers can read fields directly
    req.body = payload;
    
    // Translate action to URL path
    if (action === 'get-profile') {
      req.method = 'GET';
      req.query = { ...req.query, ...payload };
      path = 'save-profile'; // get-profile GET is handled in save-profile.js
    } else if (action === 'get-user-purchases') {
      req.method = 'GET';
      req.query = { ...req.query, ...payload };
      path = 'user-purchases';
    } else if (action === 'get-user-submissions') {
      req.method = 'GET';
      req.query = { ...req.query, ...payload };
      path = 'user-submissions';
    } else if (action === 'get-user-performance') {
      req.method = 'GET';
      req.query = { ...req.query, ...payload };
      path = 'user-performance';
    } else if (action === 'list-offline-coaching') {
      req.method = 'GET';
      req.query = { ...req.query, ...payload };
      path = 'offline-coaching';
    } else if (action === 'lookup-user-by-email' || action === 'admin/lookup-user') {
      req.method = 'POST';
      path = 'admin/lookup-user';
    } else if (action === 'grant-access' || action === 'admin/grant-access') {
      req.method = 'POST';
      path = 'admin/grant-access';
    } else if (action === 'revoke-access' || action === 'admin/revoke-access') {
      req.method = 'POST';
      path = 'admin/revoke-access';
    } else if (action === 'ao-aao/signup') {
      req.method = 'POST';
      path = 'ao-aao/signup';
    } else if (action === 'ao-aao/login') {
      req.method = 'POST';
      path = 'ao-aao/login';
    } else if (action === 'admin/ao-aao-users') {
      req.method = 'GET';
      path = 'admin/ao-aao-users';
    } else {
      path = action;
    }
  }

  console.log(`[Router] ${req.method} /api/${path}`);

  switch (path) {
    // Public routes
    case 'ping':                    return res.status(200).json({ status: 'ok', time: '10:32_UTC_deployment' });
    case 'editorial-board-members': return editorialBoardMembers(req, res);
    case 'editorial-sections':      return editorialSections(req, res);
    case 'issues':                  return issues(req, res);
    case 'mock-questions':          return mockQuestions(req, res);
    case 'mock-tests':              return mockTests(req, res);
    case 'products':                return products(req, res);
    case 'save-answer':             return saveAnswer(req, res);
    case 'save-profile':            return saveProfile(req, res);
    case 'start-test':              return startTest(req, res);
    case 'submit-test':             return submitTest(req, res);
    case 'user-purchases':          return userPurchases(req, res);
    case 'user-submissions':        return getUserSubmissions(req, res);
    case 'user-performance':        return userPerformance(req, res);

    // Admin - Mock Tests
    case 'admin/delete-mock-question': return adminDeleteMockQuestion(req, res);
    case 'admin/delete-mock-test':     return adminDeleteMockTest(req, res);
    case 'admin/save-mock-question':   return adminSaveMockQuestion(req, res);
    case 'admin/save-mock-test':       return adminSaveMockTest(req, res);

    // Admin - User Access Management
    case 'admin/all-purchases':   return adminAllPurchases(req, res);
    case 'admin/grant-access':    return adminGrantAccess(req, res);
    case 'admin/lookup-user':     return adminLookupUser(req, res);
    case 'admin/revoke-access':   return adminRevokeAccess(req, res);
    case 'admin/students':        return adminStudents(req, res);
    case 'admin/student-history': return adminStudentHistory(req, res);
    case 'admin/users':           return adminUsers(req, res);
    case 'offline-coaching':      return offlineCoaching(req, res);
    case 'admin/save-offline-coaching': return adminSaveOfflineCoaching(req, res);
    case 'admin/delete-offline-coaching': return adminDeleteOfflineCoaching(req, res);

    // AO/AAO mobile login/registration
    case 'ao-aao/signup':         return aoAaoSignup(req, res);
    case 'ao-aao/login':          return aoAaoLogin(req, res);
    case 'admin/ao-aao-users':    return adminAoAaoUsers(req, res);

    default:
      if (path === 'index' || path === '') {
        return res.status(200).json({ status: 'ok', message: 'Vercel Unified API Router Online' });
      }
      return res.status(404).json({ error: `Route /api/${path} not found in router` });
  }
}
