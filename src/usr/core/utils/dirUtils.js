import { fs as eFs, path as ePath } from './electronUtils';
import minimatch from 'minimatch';

function patternMatcher(pattern) {
  return function(path, stats) {
    const minimatcher = new minimatch.Minimatch(pattern, { matchBase: true });
    return (!minimatcher.negate || stats.isFile()) && minimatcher.match(path);
  };
}

function toMatcherFunction(ignoreEntry) {
  if (typeof ignoreEntry === "function") {
    return ignoreEntry;
  } else {
    return patternMatcher(ignoreEntry);
  }
}

export function readDir(path, ignores, callback) {
  if (typeof ignores === "function") {
    callback = ignores;
    ignores = [];
  }

  if (!callback) {
    return new Promise(function(resolve, reject) {
      readDir(path, ignores || [], function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  ignores = ignores.map(toMatcherFunction);

  let list = [];

  eFs().readdir(path, function(err, files) {
    if (err) {
      return callback(err);
    }

    let pending = files.length;
    if (!pending) {
      return callback(null, list);
    }

    files.forEach(function(file) {
      const filePath = ePath().join(path, file);
      eFs().stat(filePath, function(_err, stats) {
        if (_err) {
          return callback(_err);
        }

        if (
          ignores.some(function(matcher) {
            return matcher(filePath, stats);
          })
        ) {
          pending -= 1;
          if (!pending) {
            return callback(null, list);
          }
          return null;
        }

        if (stats.isDirectory()) {
          readDir(filePath, ignores, function(__err, res) {
            if (__err) {
              return callback(__err);
            }

            list = list.concat(res);
            pending -= 1;
            if (!pending) {
              return callback(null, list);
            }
          });
        } else {
          list.push(filePath);
          pending -= 1;
          if (!pending) {
            return callback(null, list);
          }
        }
      });
    });
  });
}
