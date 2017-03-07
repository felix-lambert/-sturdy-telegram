module.exports = {
  "devel": true,
  "curly": true,
  "esnext": true,
  "indent": 2,
  "newcap": true,
  "undef": true,
  "unused": true,
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
  },
  "rules": {
    "semi": 2,
    "comma-spacing": 1,
    "no-console": 1,                                            // disallow use of console (off by default in the node environment)
    "no-empty": 1,                                              // disallow empty statements
    "no-extra-semi": 1,                                         // disallow unnecessary semicolons
    "no-unreachable": 1,                                        // disallow unreachable statements after a return, throw, continue, or break statement
    "eqeqeq": 1,                                                // require the use of === and !==
    "no-shadow": 1,                                             // disallow declaration of variables already declared in the outer scope
    "handle-callback-err": 1,                                   // enforces error handling in callbacks (off by default) (on by default in the node environment)
    "eol-last": 1,                                              // enforce newline at the end of file, with no multiple empty lines
    "no-undef": 1,                                              // disallow use of undeclared variables unless mentioned in a /*global */ block
    "no-sync": 1,                                               // disallow use of synchronous methods (off by default)
    "max-nested-callbacks": [2],                                // specify the maximum depth callbacks can be nested (off by default)
    "no-inline-comments": 1,                                    // disallow comments inline after code (off by default)
    "no-multiple-empty-lines": [2, { "max": 2, "maxEOF": 1 }],  // disallow multiple empty lines (off by default)
    "no-var": 1,                                                // require let or const instead of var (off by default)
    "no-undefined": 1,                                          // disallow use of undefined variable (off by default)
    "no-unused-vars": 1,                                        // disallow declaration of variables that are not used in the code
    "max-params": ["error", 4]                                  // limits the number of parameters that can be used in the function declaration. (off by default)
  },
  "env": {
    "node": true,
    "es6": true
  }
};
