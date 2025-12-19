const fs = require('fs');
const path = require('path');

const readEnvFile = (filePath) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw.split(/\r?\n/).reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return acc;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      acc[key] = value;
      return acc;
    }, {});
  } catch (_err) {
    return {};
  }
};

const rootDir = path.resolve(__dirname, '..', '..');
const localEnv = readEnvFile(path.join(rootDir, '.env.local'));

module.exports = () => ({
  supabaseUrl: process.env.SUPABASE_URL || localEnv.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || localEnv.SUPABASE_ANON_KEY || '',
  supabasePublishableKey:
    process.env.SUPABASE_PUBLISHABLE_KEY || localEnv.SUPABASE_PUBLISHABLE_KEY || ''
});
