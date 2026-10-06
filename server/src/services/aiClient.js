const axios = require('axios');
const FormData = require('form-data');
const http = axios.create({ baseURL: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000', timeout: 60000 });

exports.parseResume = async (buffer, filename) => {
  const fd = new FormData();
  fd.append('file', buffer, { filename });
  return (await http.post('/parse-resume', fd, { headers: fd.getHeaders() })).data;
};
exports.match = async (payload) => (await http.post('/match', payload)).data;
exports.recommendRoles = async (payload) => (await http.post('/recommend-roles', payload)).data.roles;
exports.roadmap = async (payload) => (await http.post('/roadmap', payload)).data;
exports.questions = async (payload) => (await http.post('/interview/questions', payload)).data.questions;
exports.evaluate = async (payload) => (await http.post('/interview/evaluate', payload)).data;
exports.skills = async () => (await http.get('/skills')).data;
exports.health = async () => (await http.get('/health')).data;
