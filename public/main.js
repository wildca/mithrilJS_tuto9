(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

(function(global) {
  'use strict';

  var dateFormat = (function() {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
      var timezoneClip = /[^-+\dA-Z]/g;
  
      // Regexes and supporting functions are cached through closure
      return function (date, mask, utc, gmt) {
  
        // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
        if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }
  
        date = date || new Date;
  
        if(!(date instanceof Date)) {
          date = new Date(date);
        }
  
        if (isNaN(date)) {
          throw TypeError('Invalid date');
        }
  
        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
  
        // Allow setting the utc/gmt argument via the mask
        var maskSlice = mask.slice(0, 4);
        if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
          mask = mask.slice(4);
          utc = true;
          if (maskSlice === 'GMT:') {
            gmt = true;
          }
        }
  
        var _ = utc ? 'getUTC' : 'get';
        var d = date[_ + 'Date']();
        var D = date[_ + 'Day']();
        var m = date[_ + 'Month']();
        var y = date[_ + 'FullYear']();
        var H = date[_ + 'Hours']();
        var M = date[_ + 'Minutes']();
        var s = date[_ + 'Seconds']();
        var L = date[_ + 'Milliseconds']();
        var o = utc ? 0 : date.getTimezoneOffset();
        var W = getWeek(date);
        var N = getDayOfWeek(date);
        var flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dateFormat.i18n.dayNames[D],
          dddd: dateFormat.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dateFormat.i18n.monthNames[m],
          mmmm: dateFormat.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(Math.round(L / 10)),
          t:    H < 12 ? 'a'  : 'p',
          tt:   H < 12 ? 'am' : 'pm',
          T:    H < 12 ? 'A'  : 'P',
          TT:   H < 12 ? 'AM' : 'PM',
          Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
          o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
          W:    W,
          N:    N
        };
  
        return mask.replace(token, function (match) {
          if (match in flags) {
            return flags[match];
          }
          return match.slice(1, match.length - 1);
        });
      };
    })();

  dateFormat.masks = {
    'default':               'ddd mmm dd yyyy HH:MM:ss',
    'shortDate':             'm/d/yy',
    'mediumDate':            'mmm d, yyyy',
    'longDate':              'mmmm d, yyyy',
    'fullDate':              'dddd, mmmm d, yyyy',
    'shortTime':             'h:MM TT',
    'mediumTime':            'h:MM:ss TT',
    'longTime':              'h:MM:ss TT Z',
    'isoDate':               'yyyy-mm-dd',
    'isoTime':               'HH:MM:ss',
    'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
    'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
    'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    monthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ]
  };

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 *
 * @param  {Object} `date`
 * @return {Number}
 */
function getWeek(date) {
  // Remove time components of date
  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

  // Take January 4th as it is always in week 1 (see ISO 8601)
  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Check if daylight-saving-time-switch occurred and correct for it
  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
  targetThursday.setHours(targetThursday.getHours() - ds);

  // Number of weeks between target Thursday and first Thursday
  var weekDiff = (targetThursday - firstThursday) / (86400000*7);
  return 1 + Math.floor(weekDiff);
}

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 * 
 * @param  {Object} `date`
 * @return {Number}
 */
function getDayOfWeek(date) {
  var dow = date.getDay();
  if(dow === 0) {
    dow = 7;
  }
  return dow;
}

/**
 * kind-of shortcut
 * @param  {*} val
 * @return {String}
 */
function kindOf(val) {
  if (val === null) {
    return 'null';
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (typeof val !== 'object') {
    return typeof val;
  }

  if (Array.isArray(val)) {
    return 'array';
  }

  return {}.toString.call(val)
    .slice(8, -1).toLowerCase();
};



  if (typeof define === 'function' && define.amd) {
    define(function () {
      return dateFormat;
    });
  } else if (typeof exports === 'object') {
    module.exports = dateFormat;
  } else {
    global.dateFormat = dateFormat;
  }
})(this);

},{}],2:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

;(function(root) {
'use strict';

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
  nptable: noop,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: '^ {0,3}(?:' // optional indentation
    + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
    + '|comment[^\\n]*(\\n+|$)' // (2)
    + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
    + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
    + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
    + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
    + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
    + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
    + ')',
  def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
  table: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/,
  text: /^[^\n]+/
};

block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
block.def = edit(block.def)
  .replace('label', block._label)
  .replace('title', block._title)
  .getRegex();

block.bullet = /(?:[*+-]|\d{1,9}\.)/;
block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
block.item = edit(block.item, 'gm')
  .replace(/bull/g, block.bullet)
  .getRegex();

block.list = edit(block.list)
  .replace(/bull/g, block.bullet)
  .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
  .replace('def', '\\n+(?=' + block.def.source + ')')
  .getRegex();

block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
  + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
  + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
  + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
  + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
  + '|track|ul';
block._comment = /<!--(?!-?>)[\s\S]*?-->/;
block.html = edit(block.html, 'i')
  .replace('comment', block._comment)
  .replace('tag', block._tag)
  .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
  .getRegex();

block.paragraph = edit(block.paragraph)
  .replace('hr', block.hr)
  .replace('heading', block.heading)
  .replace('lheading', block.lheading)
  .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
  .getRegex();

block.blockquote = edit(block.blockquote)
  .replace('paragraph', block.paragraph)
  .getRegex();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ {0,3}(`{3,}|~{3,})([^`\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = edit(block.paragraph)
  .replace('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  .getRegex();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
  table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
});

/**
 * Pedantic grammar
 */

block.pedantic = merge({}, block.normal, {
  html: edit(
    '^ *(?:comment *(?:\\n|\\s*$)'
    + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
    + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
    .replace('comment', block._comment)
    .replace(/tag/g, '(?!(?:'
      + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
      + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
      + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
    .getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = Object.create(null);
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.pedantic) {
    this.rules = block.pedantic;
  } else if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top) {
  src = src.replace(/^ +$/gm, '');
  var next,
      loose,
      cap,
      bull,
      b,
      item,
      listStart,
      listItems,
      t,
      space,
      i,
      tag,
      l,
      isordered,
      istask,
      ischecked;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? rtrim(cap, '\n')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2] ? cap[2].trim() : cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (cap = this.rules.nptable.exec(src)) {
      item = {
        type: 'table',
        header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
      };

      if (item.header.length === item.align.length) {
        src = src.substring(cap[0].length);

        for (i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = 'right';
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = 'center';
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        for (i = 0; i < item.cells.length; i++) {
          item.cells[i] = splitCells(item.cells[i], item.header.length);
        }

        this.tokens.push(item);

        continue;
      }
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];
      isordered = bull.length > 1;

      listStart = {
        type: 'list_start',
        ordered: isordered,
        start: isordered ? +bull : '',
        loose: false
      };

      this.tokens.push(listStart);

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      listItems = [];
      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) */, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull.length > 1 ? b.length === 1
            : (b.length > 1 || (this.options.smartLists && b !== bull))) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        if (loose) {
          listStart.loose = true;
        }

        // Check for task list items
        istask = /^\[[ xX]\] /.test(item);
        ischecked = undefined;
        if (istask) {
          ischecked = item[1] !== ' ';
          item = item.replace(/^\[[ xX]\] +/, '');
        }

        t = {
          type: 'list_item_start',
          task: istask,
          checked: ischecked,
          loose: loose
        };

        listItems.push(t);
        this.tokens.push(t);

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      if (listStart.loose) {
        l = listItems.length;
        i = 0;
        for (; i < l; i++) {
          listItems[i].loose = true;
        }
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
      tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
      if (!this.tokens.links[tag]) {
        this.tokens.links[tag] = {
          href: cap[2],
          title: cap[3]
        };
      }
      continue;
    }

    // table (gfm)
    if (cap = this.rules.table.exec(src)) {
      item = {
        type: 'table',
        header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
      };

      if (item.header.length === item.align.length) {
        src = src.substring(cap[0].length);

        for (i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = 'right';
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = 'center';
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        for (i = 0; i < item.cells.length; i++) {
          item.cells[i] = splitCells(
            item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
            item.header.length);
        }

        this.tokens.push(item);

        continue;
      }
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
  url: noop,
  tag: '^comment'
    + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
    + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
    + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
    + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
    + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
  link: /^!?\[(label)\]\(href(?:\s+(title))?\s*\)/,
  reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
  nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
  strong: /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
  em: /^_([^\s_])_(?!_)|^\*([^\s*"<\[])\*(?!\*)|^_([^\s][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s"<\[][\s\S]*?[^\s*])\*(?!\*)|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
  code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  br: /^( {2,}|\\)\n(?!\s*$)/,
  del: noop,
  text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
};

// list of punctuation marks from common mark spec
// without ` and ] to workaround Rule 17 (inline code blocks/links)
inline._punctuation = '!"#$%&\'()*+,\\-./:;<=>?@\\[^_{|}~';
inline.em = edit(inline.em).replace(/punctuation/g, inline._punctuation).getRegex();

inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
inline.autolink = edit(inline.autolink)
  .replace('scheme', inline._scheme)
  .replace('email', inline._email)
  .getRegex();

inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

inline.tag = edit(inline.tag)
  .replace('comment', block._comment)
  .replace('attribute', inline._attribute)
  .getRegex();

inline._label = /(?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|`(?!`)|[^\[\]\\`])*?/;
inline._href = /\s*(<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*)/;
inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

inline.link = edit(inline.link)
  .replace('label', inline._label)
  .replace('href', inline._href)
  .replace('title', inline._title)
  .getRegex();

inline.reflink = edit(inline.reflink)
  .replace('label', inline._label)
  .getRegex();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
  link: edit(/^!?\[(label)\]\((.*?)\)/)
    .replace('label', inline._label)
    .getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
    .replace('label', inline._label)
    .getRegex()
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: edit(inline.escape).replace('])', '~|])').getRegex(),
  _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
  url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
  _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
  del: /^~+(?=\S)([\s\S]*?\S)~+/,
  text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
});

inline.gfm.url = edit(inline.gfm.url, 'i')
  .replace('email', inline.gfm._extended_email)
  .getRegex();
/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: edit(inline.br).replace('{2,}', '*').getRegex(),
  text: edit(inline.gfm.text).replace(/\{2,\}/g, '*').getRegex()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer();
  this.renderer.options = this.options;

  if (!this.links) {
    throw new Error('Tokens array requires a `links` property.');
  }

  if (this.options.pedantic) {
    this.rules = inline.pedantic;
  } else if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = '',
      link,
      text,
      href,
      title,
      cap,
      prevCapZero;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(cap[1]);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      if (!this.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.inRawBlock = true;
      } else if (this.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.inRawBlock = false;
      }

      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      var lastParenIndex = findClosingBracket(cap[2], '()');
      if (lastParenIndex > -1) {
        var linkLen = cap[0].length - (cap[2].length - lastParenIndex) - (cap[3] || '').length;
        cap[2] = cap[2].substring(0, lastParenIndex);
        cap[0] = cap[0].substring(0, linkLen).trim();
        cap[3] = '';
      }
      src = src.substring(cap[0].length);
      this.inLink = true;
      href = cap[2];
      if (this.options.pedantic) {
        link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

        if (link) {
          href = link[1];
          title = link[3];
        } else {
          title = '';
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : '';
      }
      href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
      out += this.outputLink(cap, {
        href: InlineLexer.escapes(href),
        title: InlineLexer.escapes(title)
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[4] || cap[3] || cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2].trim(), true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = escape(this.mangle(cap[1]));
        href = 'mailto:' + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      if (cap[2] === '@') {
        text = escape(cap[0]);
        href = 'mailto:' + text;
      } else {
        // do extended autolink path validation
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules._backpedal.exec(cap[0])[0];
        } while (prevCapZero !== cap[0]);
        text = escape(cap[0]);
        if (cap[1] === 'www.') {
          href = 'http://' + text;
        } else {
          href = text;
        }
      }
      src = src.substring(cap[0].length);
      out += this.renderer.link(href, null, text);
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      if (this.inRawBlock) {
        out += this.renderer.text(cap[0]);
      } else {
        out += this.renderer.text(escape(this.smartypants(cap[0])));
      }
      continue;
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

InlineLexer.escapes = function(text) {
  return text ? text.replace(InlineLexer.rules._escapes, '$1') : text;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = link.href,
      title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = '',
      l = text.length,
      i = 0,
      ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || marked.defaults;
}

Renderer.prototype.code = function(code, infostring, escaped) {
  var lang = (infostring || '').match(/\S*/)[0];
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw, slugger) {
  if (this.options.headerIds) {
    return '<h'
      + level
      + ' id="'
      + this.options.headerPrefix
      + slugger.slug(raw)
      + '">'
      + text
      + '</h'
      + level
      + '>\n';
  }
  // ignore IDs
  return '<h' + level + '>' + text + '</h' + level + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered, start) {
  var type = ordered ? 'ol' : 'ul',
      startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
  return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.checkbox = function(checked) {
  return '<input '
    + (checked ? 'checked="" ' : '')
    + 'disabled="" type="checkbox"'
    + (this.options.xhtml ? ' /' : '')
    + '> ';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  if (body) body = '<tbody>' + body + '</tbody>';

  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + body
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' align="' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
  if (href === null) {
    return text;
  }
  var out = '<a href="' + escape(href) + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
  if (href === null) {
    return text;
  }

  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * TextRenderer
 * returns only the textual part of the token
 */

function TextRenderer() {}

// no need for block level renderers

TextRenderer.prototype.strong =
TextRenderer.prototype.em =
TextRenderer.prototype.codespan =
TextRenderer.prototype.del =
TextRenderer.prototype.text = function (text) {
  return text;
};

TextRenderer.prototype.link =
TextRenderer.prototype.image = function(href, title, text) {
  return '' + text;
};

TextRenderer.prototype.br = function() {
  return '';
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer();
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
  this.slugger = new Slugger();
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options) {
  var parser = new Parser(options);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options);
  // use an InlineLexer with a TextRenderer to extract pure text
  this.inlineText = new InlineLexer(
    src.links,
    merge({}, this.options, {renderer: new TextRenderer()})
  );
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        unescape(this.inlineText.output(this.token.text)),
        this.slugger);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = '',
          body = '',
          i,
          row,
          cell,
          j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      body = '';
      var ordered = this.token.ordered,
          start = this.token.start;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered, start);
    }
    case 'list_item_start': {
      body = '';
      var loose = this.token.loose;
      var checked = this.token.checked;
      var task = this.token.task;

      if (this.token.task) {
        body += this.renderer.checkbox(checked);
      }

      while (this.next().type !== 'list_item_end') {
        body += !loose && this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }
      return this.renderer.listitem(body, task, checked);
    }
    case 'html': {
      // TODO parse inline content if parameter markdown=1
      return this.renderer.html(this.token.text);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
    default: {
      var errMsg = 'Token with "' + this.token.type + '" type was not found.';
      if (this.options.silent) {
        console.log(errMsg);
      } else {
        throw new Error(errMsg);
      }
    }
  }
};

/**
 * Slugger generates header id
 */

function Slugger () {
  this.seen = {};
}

/**
 * Convert string to unique id
 */

Slugger.prototype.slug = function (value) {
  var slug = value
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-');

  if (this.seen.hasOwnProperty(slug)) {
    var originalSlug = slug;
    do {
      this.seen[originalSlug]++;
      slug = originalSlug + '-' + this.seen[originalSlug];
    } while (this.seen.hasOwnProperty(slug));
  }
  this.seen[slug] = 0;

  return slug;
};

/**
 * Helpers
 */

function escape(html, encode) {
  if (encode) {
    if (escape.escapeTest.test(html)) {
      return html.replace(escape.escapeReplace, function (ch) { return escape.replacements[ch]; });
    }
  } else {
    if (escape.escapeTestNoEncode.test(html)) {
      return html.replace(escape.escapeReplaceNoEncode, function (ch) { return escape.replacements[ch]; });
    }
  }

  return html;
}

escape.escapeTest = /[&<>"']/;
escape.escapeReplace = /[&<>"']/g;
escape.replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

escape.escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
escape.escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;

function unescape(html) {
  // explicitly match decimal, hex, and named HTML entities
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function edit(regex, opt) {
  regex = regex.source || regex;
  opt = opt || '';
  return {
    replace: function(name, val) {
      val = val.source || val;
      val = val.replace(/(^|[^\[])\^/g, '$1');
      regex = regex.replace(name, val);
      return this;
    },
    getRegex: function() {
      return new RegExp(regex, opt);
    }
  };
}

function cleanUrl(sanitize, base, href) {
  if (sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return null;
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return null;
    }
  }
  if (base && !originIndependentUrl.test(href)) {
    href = resolveUrl(base, href);
  }
  try {
    href = encodeURI(href).replace(/%25/g, '%');
  } catch (e) {
    return null;
  }
  return href;
}

function resolveUrl(base, href) {
  if (!baseUrls[' ' + base]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (/^[^:]+:\/*[^/]*$/.test(base)) {
      baseUrls[' ' + base] = base + '/';
    } else {
      baseUrls[' ' + base] = rtrim(base, '/', true);
    }
  }
  base = baseUrls[' ' + base];

  if (href.slice(0, 2) === '//') {
    return base.replace(/:[\s\S]*/, ':') + href;
  } else if (href.charAt(0) === '/') {
    return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
  } else {
    return base + href;
  }
}
var baseUrls = {};
var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1,
      target,
      key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}

function splitCells(tableRow, count) {
  // ensure that every cell-delimiting pipe has a space
  // before it to distinguish it from an escaped pipe
  var row = tableRow.replace(/\|/g, function (match, offset, str) {
        var escaped = false,
            curr = offset;
        while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
        if (escaped) {
          // odd number of slashes means | is escaped
          // so we leave it alone
          return '|';
        } else {
          // add space before unescaped |
          return ' |';
        }
      }),
      cells = row.split(/ \|/),
      i = 0;

  if (cells.length > count) {
    cells.splice(count);
  } else {
    while (cells.length < count) cells.push('');
  }

  for (; i < cells.length; i++) {
    // leading or trailing whitespace is ignored per the gfm spec
    cells[i] = cells[i].trim().replace(/\\\|/g, '|');
  }
  return cells;
}

// Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
// /c*$/ is vulnerable to REDOS.
// invert: Remove suffix of non-c chars instead. Default falsey.
function rtrim(str, c, invert) {
  if (str.length === 0) {
    return '';
  }

  // Length of suffix matching the invert condition.
  var suffLen = 0;

  // Step left until we fail to match the invert condition.
  while (suffLen < str.length) {
    var currChar = str.charAt(str.length - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }

  return str.substr(0, str.length - suffLen);
}

function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  var level = 0;
  for (var i = 0; i < str.length; i++) {
    if (str[i] === '\\') {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Marked
 */

function marked(src, opt, callback) {
  // throw error in case of non string input
  if (typeof src === 'undefined' || src === null) {
    throw new Error('marked(): input parameter is undefined or null');
  }
  if (typeof src !== 'string') {
    throw new Error('marked(): input parameter is of type '
      + Object.prototype.toString.call(src) + ', string expected');
  }

  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight,
        tokens,
        pending,
        i = 0;

    try {
      tokens = Lexer.lex(src, opt);
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/markedjs/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.getDefaults = function () {
  return {
    baseUrl: null,
    breaks: false,
    gfm: true,
    headerIds: true,
    headerPrefix: '',
    highlight: null,
    langPrefix: 'language-',
    mangle: true,
    pedantic: false,
    renderer: new Renderer(),
    sanitize: false,
    sanitizer: null,
    silent: false,
    smartLists: false,
    smartypants: false,
    tables: true,
    xhtml: false
  };
};

marked.defaults = marked.getDefaults();

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;
marked.TextRenderer = TextRenderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.Slugger = Slugger;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  root.marked = marked;
}
})(this || (typeof window !== 'undefined' ? window : global));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
;(function() {
"use strict"
function Vnode(tag, key, attrs0, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
	return node
}
Vnode.normalizeChildren = function normalizeChildren(children) {
	for (var i = 0; i < children.length; i++) {
		children[i] = Vnode.normalize(children[i])
	}
	return children
}
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty
function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}
function execSelector(state, attrs, children) {
	var hasAttrs = false, childList, text
	var className = attrs.className || attrs.class
	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key)) {
			attrs[key] = state.attrs[key]
		}
	}
	if (className !== undefined) {
		if (attrs.class !== undefined) {
			attrs.class = undefined
			attrs.className = className
		}
		if (state.attrs.className != null) {
			attrs.className = state.attrs.className + " " + className
		}
	}
	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			hasAttrs = true
			break
		}
	}
	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		text = children[0].children
	} else {
		childList = children
	}
	return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text)
}
function hyperscript(selector) {
	// Because sloppy mode sucks
	var attrs = arguments[1], start = 2, children
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	if (typeof selector === "string") {
		var cached = selectorCache[selector] || compileSelector(selector)
	}
	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = 1
	}
	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}
	var normalized = Vnode.normalizeChildren(children)
	if (typeof selector === "string") {
		return execSelector(cached, attrs, normalized)
	} else {
		return Vnode(selector, attrs.key, attrs, normalized)
	}
}
hyperscript.trust = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}
hyperscript.fragment = function(attrs1, children) {
	return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
}
var m = hyperscript
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")
	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}
	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") window.Promise = PromisePolyfill
	var PromisePolyfill = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") global.Promise = PromisePolyfill
	var PromisePolyfill = global.Promise
} else {
}
var buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""
	var args = []
	for (var key0 in object) {
		destructure(key0, object[key0])
	}
	return args.join("&")
	function destructure(key0, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key0 + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key0 + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}
var FILE_PROTOCOL_REGEX = new RegExp("^file://", "i")
var _8 = function($window, Promise) {
	var callbackCount = 0
	var oncompletion
	function setCompletionCallback(callback) {oncompletion = callback}
	function finalizer() {
		var count = 0
		function complete() {if (--count === 0 && typeof oncompletion === "function") oncompletion()}
		return function finalize(promise0) {
			var then0 = promise0.then
			promise0.then = function() {
				count++
				var next = then0.apply(promise0, arguments)
				next.then(complete, function(e) {
					complete()
					if (count === 0) throw e
				})
				return finalize(next)
			}
			return promise0
		}
	}
	function normalize(args, extra) {
		if (typeof args === "string") {
			var url = args
			args = extra || {}
			if (args.url == null) args.url = url
		}
		return args
	}
	function request(args, extra) {
		var finalize = finalizer()
		args = normalize(args, extra)
		var promise0 = new Promise(function(resolve, reject) {
			if (args.method == null) args.method = "GET"
			args.method = args.method.toUpperCase()
			var useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true)
			if (typeof args.serialize !== "function") args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify
			if (typeof args.deserialize !== "function") args.deserialize = deserialize
			if (typeof args.extract !== "function") args.extract = extract
			args.url = interpolate(args.url, args.data)
			if (useBody) args.data = args.serialize(args.data)
			else args.url = assemble(args.url, args.data)
			var xhr = new $window.XMLHttpRequest(),
				aborted = false,
				_abort = xhr.abort
			xhr.abort = function abort() {
				aborted = true
				_abort.call(xhr)
			}
			xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)
			if (args.serialize === JSON.stringify && useBody) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (args.deserialize === deserialize) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			for (var key in args.headers) if ({}.hasOwnProperty.call(args.headers, key)) {
				xhr.setRequestHeader(key, args.headers[key])
			}
			if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort().
				if(aborted) return
				if (xhr.readyState === 4) {
					try {
						var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args))
						if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
							resolve(cast(args.type, response))
						}
						else {
							var error = new Error(xhr.responseText)
							for (var key in response) error[key] = response[key]
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}
			if (useBody && (args.data != null)) xhr.send(args.data)
			else xhr.send()
		})
		return args.background === true ? promise0 : finalize(promise0)
	}
	function jsonp(args, extra) {
		var finalize = finalizer()
		args = normalize(args, extra)
		var promise0 = new Promise(function(resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script)
				resolve(cast(args.type, data))
				delete $window[callbackName]
			}
			script.onerror = function() {
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
				delete $window[callbackName]
			}
			if (args.data == null) args.data = {}
			args.url = interpolate(args.url, args.data)
			args.data[args.callbackKey || "callback"] = callbackName
			script.src = assemble(args.url, args.data)
			$window.document.documentElement.appendChild(script)
		})
		return args.background === true? promise0 : finalize(promise0)
	}
	function interpolate(url, data) {
		if (data == null) return url
		var tokens = url.match(/:[^\/]+/gi) || []
		for (var i = 0; i < tokens.length; i++) {
			var key = tokens[i].slice(1)
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key])
			}
		}
		return url
	}
	function assemble(url, data) {
		var querystring = buildQueryString(data)
		if (querystring !== "") {
			var prefix = url.indexOf("?") < 0 ? "?" : "&"
			url += prefix + querystring
		}
		return url
	}
	function deserialize(data) {
		try {return data !== "" ? JSON.parse(data) : null}
		catch (e) {throw new Error(data)}
	}
	function extract(xhr) {return xhr.responseText}
	function cast(type0, data) {
		if (typeof type0 === "function") {
			if (Array.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					data[i] = new type0(data[i])
				}
			}
			else return new type0(data)
		}
		return data
	}
	return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
}
var requestService = _8(window, PromisePolyfill)
var coreRenderer = function($window) {
	var $doc = $window.document
	var $emptyFragment = $doc.createDocumentFragment()
	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}
	var onevent
	function setEventCallback(callback) {return onevent = callback}
	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": return createText(parent, vnode, nextSibling)
				case "<": return createHTML(parent, vnode, nextSibling)
				case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
				default: return createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else return createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
		return vnode.dom
	}
	function createHTML(parent, vnode, nextSibling) {
		var match1 = vnode.children.match(/^\s*?<(\w+)/im) || []
		var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div"
		var temp = $doc.createElement(parent1)
		temp.innerHTML = vnode.children
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
		return fragment
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
		return fragment
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs2 = vnode.attrs
		var is = attrs2 && attrs2.is
		ns = getNameSpace(vnode) || ns
		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element
		if (attrs2 != null) {
			setAttrs(vnode, attrs2, ns)
		}
		insertNode(parent, element, nextSibling)
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode)
		}
		else {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				setLateAttrs(vnode)
			}
		}
		return element
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		vnode._state = vnode.state
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		initLifecycle(vnode._state, vnode, hooks)
		vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			var element = createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
			insertNode(parent, element, nextSibling)
			return element
		}
		else {
			vnode.domSize = 0
			return $emptyFragment
		}
	}
	//update
	function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null) removeNodes(old, 0, old.length, vnodes)
		else {
			if (old.length === vnodes.length) {
				var isUnkeyed = false
				for (var i = 0; i < vnodes.length; i++) {
					if (vnodes[i] != null && old[i] != null) {
						isUnkeyed = vnodes[i].key == null && old[i].key == null
						break
					}
				}
				if (isUnkeyed) {
					for (var i = 0; i < old.length; i++) {
						if (old[i] === vnodes[i]) continue
						else if (old[i] == null && vnodes[i] != null) createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling))
						else if (vnodes[i] == null) removeNodes(old, i, i + 1, vnodes)
						else updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns)
					}
					return
				}
			}
			recycling = recycling || isRecyclable(old, vnodes)
			if (recycling) {
				var pool = old.pool
				old = old.concat(old.pool)
			}
			var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldStart], v = vnodes[start]
				if (o === v && !recycling) oldStart++, start++
				else if (o == null) oldStart++
				else if (v == null) start++
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling)
					oldStart++, start++
					updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns)
					if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
				}
				else {
					var o = old[oldEnd]
					if (o === v && !recycling) oldEnd--, start++
					else if (o == null) oldEnd--
					else if (v == null) start++
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
						if (recycling || start < end) insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling))
						oldEnd--, start++
					}
					else break
				}
			}
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldEnd], v = vnodes[end]
				if (o === v && !recycling) oldEnd--, end--
				else if (o == null) oldEnd--
				else if (v == null) end--
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
					updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
					if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
					if (o.dom != null) nextSibling = o.dom
					oldEnd--, end--
				}
				else {
					if (!map) map = getKeyMap(old, oldEnd)
					if (v != null) {
						var oldIndex = map[v.key]
						if (oldIndex != null) {
							var movable = old[oldIndex]
							var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling)
							updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns)
							insertNode(parent, toFragment(movable), nextSibling)
							old[oldIndex].skip = true
							if (movable.dom != null) nextSibling = movable.dom
						}
						else {
							var dom = createNode(parent, v, hooks, ns, nextSibling)
							nextSibling = dom
						}
					}
					end--
				}
				if (end < start) break
			}
			createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
			removeNodes(old, oldStart, oldEnd + 1, vnodes)
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode._state = old._state
			vnode.events = old.events
			if (!recycling && shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					if (recycling) {
						vnode.state = {}
						initLifecycle(vnode.attrs, vnode, hooks)
					}
					else updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, nextSibling); break
					case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, recycling, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns)
		}
		else {
			removeNode(old, null)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, nextSibling) {
		if (old.children !== vnode.children) {
			toFragment(old)
			createHTML(parent, vnode, nextSibling)
		}
		else vnode.dom = old.dom, vnode.domSize = old.domSize
	}
	function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, recycling, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns
		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle0 multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode)
		}
		else if (old.text != null && vnode.text != null && vnode.text !== "") {
			if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
		}
		else {
			if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
			if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns)
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		if (recycling) {
			initComponent(vnode, hooks)
		} else {
			vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
			if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
			if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
			updateLifecycle(vnode._state, vnode, hooks)
		}
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(old.instance, null)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function isRecyclable(old, vnodes) {
		if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
			var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0
			var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0
			var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0
			if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
				return true
			}
		}
		return false
	}
	function getKeyMap(vnodes, end) {
		var map = {}, i = 0
		for (var i = 0; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				var key2 = vnode.key
				if (key2 != null) map[key2] = i
			}
		}
		return map
	}
	function toFragment(vnode) {
		var count0 = vnode.domSize
		if (count0 != null || vnode.dom == null) {
			var fragment = $doc.createDocumentFragment()
			if (count0 > 0) {
				var dom = vnode.dom
				while (--count0) fragment.appendChild(dom.nextSibling)
				fragment.insertBefore(dom, fragment.firstChild)
			}
			return fragment
		}
		else return vnode.dom
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling && nextSibling.parentNode) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}
	function setContentEditable(vnode) {
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
	}
	//remove
	function removeNodes(vnodes, start, end, context) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				if (vnode.skip) vnode.skip = false
				else removeNode(vnode, context)
			}
		}
	}
	function removeNode(vnode, context) {
		var expected = 1, called = 0
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
			var result = vnode._state.onbeforeremove.call(vnode.state, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		continuation()
		function continuation() {
			if (++called === expected) {
				onremove(vnode)
				if (vnode.dom) {
					var count0 = vnode.domSize || 1
					if (count0 > 1) {
						var dom = vnode.dom
						while (--count0) {
							removeNodeFromDOM(dom.nextSibling)
						}
					}
					removeNodeFromDOM(vnode.dom)
					if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
						if (!context.pool) context.pool = [vnode]
						else context.pool.push(vnode)
					}
				}
			}
		}
	}
	function removeNodeFromDOM(node) {
		var parent = node.parentNode
		if (parent != null) parent.removeChild(node)
	}
	function onremove(vnode) {
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") vnode.attrs.onremove.call(vnode.state, vnode)
		if (typeof vnode.tag !== "string" && typeof vnode._state.onremove === "function") vnode._state.onremove.call(vnode.state, vnode)
		if (vnode.instance != null) onremove(vnode.instance)
		else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode, attrs2, ns) {
		for (var key2 in attrs2) {
			setAttr(vnode, key2, null, attrs2[key2], ns)
		}
	}
	function setAttr(vnode, key2, old, value, ns) {
		var element = vnode.dom
		if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) return
		var nsLastIndex = key2.indexOf(":")
		if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
			element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value)
		}
		else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") updateEvent(vnode, key2, value)
		else if (key2 === "style") updateStyle(element, old, value)
		else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
			if (key2 === "value") {
				var normalized0 = "" + value // eslint-disable-line no-implicit-coercion
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select") {
					if (value === null) {
						if (vnode.dom.selectedIndex === -1 && vnode.dom === $doc.activeElement) return
					} else {
						if (old !== null && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
					}
				}
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old != null && vnode.dom.value === normalized0) return
			}
			// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error0 will occur.
			if (vnode.tag === "input" && key2 === "type") {
				element.setAttribute(key2, value)
				return
			}
			element[key2] = value
		}
		else {
			if (typeof value === "boolean") {
				if (value) element.setAttribute(key2, "")
				else element.removeAttribute(key2)
			}
			else element.setAttribute(key2 === "className" ? "class" : key2, value)
		}
	}
	function setLateAttrs(vnode) {
		var attrs2 = vnode.attrs
		if (vnode.tag === "select" && attrs2 != null) {
			if ("value" in attrs2) setAttr(vnode, "value", null, attrs2.value, undefined)
			if ("selectedIndex" in attrs2) setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined)
		}
	}
	function updateAttrs(vnode, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, old && old[key2], attrs2[key2], ns)
			}
		}
		if (old != null) {
			for (var key2 in old) {
				if (attrs2 == null || !(key2 in attrs2)) {
					if (key2 === "className") key2 = "class"
					if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) updateEvent(vnode, key2, undefined)
					else if (key2 !== "key") vnode.dom.removeAttribute(key2)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function isAttribute(attr) {
		return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
	}
	function isCustomElement(vnode){
		return vnode.attrs.is || vnode.tag.indexOf("-") > -1
	}
	function hasIntegrationMethods(source) {
		return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
	}
	//style
	function updateStyle(element, old, style) {
		if (old === style) element.style.cssText = "", old = null
		if (style == null) element.style.cssText = ""
		else if (typeof style === "string") element.style.cssText = style
		else {
			if (typeof old === "string") element.style.cssText = ""
			for (var key2 in style) {
				element.style[key2] = style[key2]
			}
			if (old != null && typeof old !== "string") {
				for (var key2 in old) {
					if (!(key2 in style)) element.style[key2] = ""
				}
			}
		}
	}
	//event
	function updateEvent(vnode, key2, value) {
		var element = vnode.dom
		var callback = typeof onevent !== "function" ? value : function(e) {
			var result = value.call(element, e)
			onevent.call(element, e)
			return result
		}
		if (key2 in element) element[key2] = typeof value === "function" ? callback : null
		else {
			var eventName = key2.slice(2)
			if (vnode.events === undefined) vnode.events = {}
			if (vnode.events[key2] === callback) return
			if (vnode.events[key2] != null) element.removeEventListener(eventName, vnode.events[key2], false)
			if (typeof value === "function") {
				vnode.events[key2] = callback
				element.addEventListener(eventName, vnode.events[key2], false)
			}
		}
	}
	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") source.oninit.call(vnode.state, vnode)
		if (typeof source.oncreate === "function") hooks.push(source.oncreate.bind(vnode.state, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(source.onupdate.bind(vnode.state, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		var forceVnodeUpdate, forceComponentUpdate
		if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old)
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old)
		if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
			return true
		}
		return false
	}
	function render(dom, vnodes) {
		if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = $doc.activeElement
		var namespace = dom.namespaceURI
		// First time0 rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""
		if (!Array.isArray(vnodes)) vnodes = [vnodes]
		updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		dom.vnodes = vnodes
		for (var i = 0; i < hooks.length; i++) hooks[i]()
		// document.activeElement can return null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
		if (active != null && $doc.activeElement !== active) active.focus()
	}
	return {render: render, setEventCallback: setEventCallback}
}
function throttle(callback) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	var time = 16
	var last = 0, pending = null
	var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout
	return function() {
		var now = Date.now()
		if (last === 0 || now - last >= time) {
			last = now
			callback()
		}
		else if (pending === null) {
			pending = timeout(function() {
				pending = null
				callback()
				last = Date.now()
			}, time - (now - last))
		}
	}
}
var _11 = function($window) {
	var renderService = coreRenderer($window)
	renderService.setEventCallback(function(e) {
		if (e.redraw === false) e.redraw = undefined
		else redraw()
	})
	var callbacks = []
	function subscribe(key1, callback) {
		unsubscribe(key1)
		callbacks.push(key1, throttle(callback))
	}
	function unsubscribe(key1) {
		var index = callbacks.indexOf(key1)
		if (index > -1) callbacks.splice(index, 2)
	}
	function redraw() {
		for (var i = 1; i < callbacks.length; i += 2) {
			callbacks[i]()
		}
	}
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
}
var redrawService = _11(window)
requestService.setCompletionCallback(redrawService.redraw)
var _16 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, [])
			redrawService0.unsubscribe(root)
			return
		}
		
		if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
		
		var run0 = function() {
			redrawService0.render(root, Vnode(component))
		}
		redrawService0.subscribe(root, run0)
		redrawService0.redraw()
	}
}
m.mount = _16(redrawService)
var Promise = PromisePolyfill
var parseQueryString = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)
	var entries = string.split("&"), data0 = {}, counters = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key5 = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""
		if (value === "true") value = true
		else if (value === "false") value = false
		var levels = key5.split(/\]\[?|\[/)
		var cursor = data0
		if (key5.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			var isValue = j === levels.length - 1
			if (level === "") {
				var key5 = levels.slice(0, j).join()
				if (counters[key5] == null) counters[key5] = 0
				level = counters[key5]++
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {}
			}
			cursor = cursor[level]
		}
	}
	return data0
}
var coreRouter = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function"
	var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout
	function normalize1(fragment0) {
		var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
		if (fragment0 === "pathname" && data[0] !== "/") data = "/" + data
		return data
	}
	var asyncId
	function debounceAsync(callback0) {
		return function() {
			if (asyncId != null) return
			asyncId = callAsync0(function() {
				asyncId = null
				callback0()
			})
		}
	}
	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?")
		var hashIndex = path.indexOf("#")
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd))
			for (var key4 in queryParams) queryData[key4] = queryParams[key4]
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1))
			for (var key4 in hashParams) hashData[key4] = hashParams[key4]
		}
		return path.slice(0, pathEnd)
	}
	var router = {prefix: "#!"}
	router.getPath = function() {
		var type2 = router.prefix.charAt(0)
		switch (type2) {
			case "#": return normalize1("hash").slice(router.prefix.length)
			case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
			default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
		}
	}
	router.setPath = function(path, data, options) {
		var queryData = {}, hashData = {}
		path = parsePath(path, queryData, hashData)
		if (data != null) {
			for (var key4 in data) queryData[key4] = data[key4]
			path = path.replace(/:([^\/]+)/g, function(match2, token) {
				delete queryData[token]
				return data[token]
			})
		}
		var query = buildQueryString(queryData)
		if (query) path += "?" + query
		var hash = buildQueryString(hashData)
		if (hash) path += "#" + hash
		if (supportsPushState) {
			var state = options ? options.state : null
			var title = options ? options.title : null
			$window.onpopstate()
			if (options && options.replace) $window.history.replaceState(state, title, router.prefix + path)
			else $window.history.pushState(state, title, router.prefix + path)
		}
		else $window.location.href = router.prefix + path
	}
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			var path = router.getPath()
			var params = {}
			var pathname = parsePath(path, params, params)
			var state = $window.history.state
			if (state != null) {
				for (var k in state) params[k] = state[k]
			}
			for (var route0 in routes) {
				var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route0.match(/:[^\/]+/g) || []
						var values = [].slice.call(arguments, 1, -2)
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
						}
						resolve(routes[route0], params, path, route0)
					})
					return
				}
			}
			reject(path, params)
		}
		if (supportsPushState) $window.onpopstate = debounceAsync(resolveRoute)
		else if (router.prefix.charAt(0) === "#") $window.onhashchange = resolveRoute
		resolveRoute()
	}
	return router
}
var _20 = function($window, redrawService0) {
	var routeService = coreRouter($window)
	var identity = function(v) {return v}
	var render1, component, attrs3, currentPath, lastUpdate
	var route = function(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		var run1 = function() {
			if (render1 != null) redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3)))
		}
		var bail = function(path) {
			if (path !== defaultRoute) routeService.setPath(defaultRoute, null, {replace: true})
			else throw new Error("Could not resolve default route " + defaultRoute)
		}
		routeService.defineRoutes(routes, function(payload, params, path) {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) return
				component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
				attrs3 = params, currentPath = path, lastUpdate = null
				render1 = (routeResolver.render || identity).bind(routeResolver)
				run1()
			}
			if (payload.view || typeof payload === "function") update({}, payload)
			else {
				if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
						update(payload, resolved)
					}, bail)
				}
				else update(payload, "div")
			}
		}, bail)
		redrawService0.subscribe(root, run1)
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		routeService.setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = function(prefix0) {routeService.prefix = prefix0}
	route.link = function(vnode1) {
		vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href)
		vnode1.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return
			e.preventDefault()
			e.redraw = false
			var href = this.getAttribute("href")
			if (href.indexOf(routeService.prefix) === 0) href = href.slice(routeService.prefix.length)
			route.set(href, undefined, undefined)
		}
	}
	route.param = function(key3) {
		if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") return attrs3[key3]
		return attrs3
	}
	return route
}
m.route = _20(window, redrawService)
m.withAttr = function(attrName, callback1, context) {
	return function(e) {
		callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName))
	}
}
var _28 = coreRenderer(window)
m.render = _28.render
m.redraw = redrawService.redraw
m.request = requestService.request
m.jsonp = requestService.jsonp
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.version = "1.1.4"
m.vnode = Vnode
if (typeof module !== "undefined") module["exports"] = m
else window.m = m
}());
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
/*
Copyright (c) 2015, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
         Adonis Fung <adon@yahoo-inc.com>
         Albert Yu <albertyu@yahoo-inc.com>
*/
/*jshint node: true */

exports._getPrivFilters = function () {

    var LT     = /</g,
        QUOT   = /"/g,
        SQUOT  = /'/g,
        AMP    = /&/g,
        NULL   = /\x00/g,
        SPECIAL_ATTR_VALUE_UNQUOTED_CHARS = /(?:^$|[\x00\x09-\x0D "'`=<>])/g,
        SPECIAL_HTML_CHARS = /[&<>"'`]/g, 
        SPECIAL_COMMENT_CHARS = /(?:\x00|^-*!?>|--!?>|--?!?$|\]>|\]$)/g;

    // CSS sensitive chars: ()"'/,!*@{}:;
    // By CSS: (Tab|NewLine|colon|semi|lpar|rpar|apos|sol|comma|excl|ast|midast);|(quot|QUOT)
    // By URI_PROTOCOL: (Tab|NewLine);
    var SENSITIVE_HTML_ENTITIES = /&(?:#([xX][0-9A-Fa-f]+|\d+);?|(Tab|NewLine|colon|semi|lpar|rpar|apos|sol|comma|excl|ast|midast|ensp|emsp|thinsp);|(nbsp|amp|AMP|lt|LT|gt|GT|quot|QUOT);?)/g,
        SENSITIVE_NAMED_REF_MAP = {Tab: '\t', NewLine: '\n', colon: ':', semi: ';', lpar: '(', rpar: ')', apos: '\'', sol: '/', comma: ',', excl: '!', ast: '*', midast: '*', ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', nbsp: '\xA0', amp: '&', lt: '<', gt: '>', quot: '"', QUOT: '"'};

    // var CSS_VALID_VALUE = 
    //     /^(?:
    //     (?!-*expression)#?[-\w]+
    //     |[+-]?(?:\d+|\d*\.\d+)(?:em|ex|ch|rem|px|mm|cm|in|pt|pc|%|vh|vw|vmin|vmax)?
    //     |!important
    //     | //empty
    //     )$/i;
    var CSS_VALID_VALUE = /^(?:(?!-*expression)#?[-\w]+|[+-]?(?:\d+|\d*\.\d+)(?:r?em|ex|ch|cm|mm|in|px|pt|pc|%|vh|vw|vmin|vmax)?|!important|)$/i,
        // TODO: prevent double css escaping by not encoding \ again, but this may require CSS decoding
        // \x7F and \x01-\x1F less \x09 are for Safari 5.0, added []{}/* for unbalanced quote
        CSS_DOUBLE_QUOTED_CHARS = /[\x00-\x1F\x7F\[\]{}\\"]/g,
        CSS_SINGLE_QUOTED_CHARS = /[\x00-\x1F\x7F\[\]{}\\']/g,
        // (, \u207D and \u208D can be used in background: 'url(...)' in IE, assumed all \ chars are encoded by QUOTED_CHARS, and null is already replaced with \uFFFD
        // otherwise, use this CSS_BLACKLIST instead (enhance it with url matching): /(?:\\?\(|[\u207D\u208D]|\\0{0,4}28 ?|\\0{0,2}20[78][Dd] ?)+/g
        CSS_BLACKLIST = /url[\(\u207D\u208D]+/g,
        // this assumes encodeURI() and encodeURIComponent() has escaped 1-32, 127 for IE8
        CSS_UNQUOTED_URL = /['\(\)]/g; // " \ treated by encodeURI()

    // Given a full URI, need to support "[" ( IPv6address ) "]" in URI as per RFC3986
    // Reference: https://tools.ietf.org/html/rfc3986
    var URL_IPV6 = /\/\/%5[Bb]([A-Fa-f0-9:]+)%5[Dd]/;


    // Reference: http://shazzer.co.uk/database/All/characters-allowd-in-html-entities
    // Reference: http://shazzer.co.uk/vector/Characters-allowed-after-ampersand-in-named-character-references
    // Reference: http://shazzer.co.uk/database/All/Characters-before-javascript-uri
    // Reference: http://shazzer.co.uk/database/All/Characters-after-javascript-uri
    // Reference: https://html.spec.whatwg.org/multipage/syntax.html#consume-a-character-reference
    // Reference for named characters: https://html.spec.whatwg.org/multipage/entities.json
    var URI_BLACKLIST_PROTOCOLS = {'javascript':1, 'data':1, 'vbscript':1, 'mhtml':1, 'x-schema':1},
        URI_PROTOCOL_COLON = /(?::|&#[xX]0*3[aA];?|&#0*58;?|&colon;)/,
        URI_PROTOCOL_WHITESPACES = /(?:^[\x00-\x20]+|[\t\n\r\x00]+)/g,
        URI_PROTOCOL_NAMED_REF_MAP = {Tab: '\t', NewLine: '\n'};

    var x, 
        strReplace = function (s, regexp, callback) {
            return s === undefined ? 'undefined'
                    : s === null            ? 'null'
                    : s.toString().replace(regexp, callback);
        },
        fromCodePoint = String.fromCodePoint || function(codePoint) {
            if (arguments.length === 0) {
                return '';
            }
            if (codePoint <= 0xFFFF) { // BMP code point
                return String.fromCharCode(codePoint);
            }

            // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            return String.fromCharCode((codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00);
        };


    function getProtocol(str) {
        var s = str.split(URI_PROTOCOL_COLON, 2);
        // str.length !== s[0].length is for older IE (e.g., v8), where delimeter residing at last will result in length equals 1, but not 2
        return (s[0] && (s.length === 2 || str.length !== s[0].length)) ? s[0] : null;
    }

    function htmlDecode(s, namedRefMap, reNamedRef, skipReplacement) {
        
        namedRefMap = namedRefMap || SENSITIVE_NAMED_REF_MAP;
        reNamedRef = reNamedRef || SENSITIVE_HTML_ENTITIES;

        function regExpFunction(m, num, named, named1) {
            if (num) {
                num = Number(num[0] <= '9' ? num : '0' + num);
                // switch(num) {
                //     case 0x80: return '\u20AC';  // EURO SIGN (€)
                //     case 0x82: return '\u201A';  // SINGLE LOW-9 QUOTATION MARK (‚)
                //     case 0x83: return '\u0192';  // LATIN SMALL LETTER F WITH HOOK (ƒ)
                //     case 0x84: return '\u201E';  // DOUBLE LOW-9 QUOTATION MARK („)
                //     case 0x85: return '\u2026';  // HORIZONTAL ELLIPSIS (…)
                //     case 0x86: return '\u2020';  // DAGGER (†)
                //     case 0x87: return '\u2021';  // DOUBLE DAGGER (‡)
                //     case 0x88: return '\u02C6';  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
                //     case 0x89: return '\u2030';  // PER MILLE SIGN (‰)
                //     case 0x8A: return '\u0160';  // LATIN CAPITAL LETTER S WITH CARON (Š)
                //     case 0x8B: return '\u2039';  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
                //     case 0x8C: return '\u0152';  // LATIN CAPITAL LIGATURE OE (Œ)
                //     case 0x8E: return '\u017D';  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
                //     case 0x91: return '\u2018';  // LEFT SINGLE QUOTATION MARK (‘)
                //     case 0x92: return '\u2019';  // RIGHT SINGLE QUOTATION MARK (’)
                //     case 0x93: return '\u201C';  // LEFT DOUBLE QUOTATION MARK (“)
                //     case 0x94: return '\u201D';  // RIGHT DOUBLE QUOTATION MARK (”)
                //     case 0x95: return '\u2022';  // BULLET (•)
                //     case 0x96: return '\u2013';  // EN DASH (–)
                //     case 0x97: return '\u2014';  // EM DASH (—)
                //     case 0x98: return '\u02DC';  // SMALL TILDE (˜)
                //     case 0x99: return '\u2122';  // TRADE MARK SIGN (™)
                //     case 0x9A: return '\u0161';  // LATIN SMALL LETTER S WITH CARON (š)
                //     case 0x9B: return '\u203A';  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
                //     case 0x9C: return '\u0153';  // LATIN SMALL LIGATURE OE (œ)
                //     case 0x9E: return '\u017E';  // LATIN SMALL LETTER Z WITH CARON (ž)
                //     case 0x9F: return '\u0178';  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
                // }
                // // num >= 0xD800 && num <= 0xDFFF, and 0x0D is separately handled, as it doesn't fall into the range of x.pec()
                // return (num >= 0xD800 && num <= 0xDFFF) || num === 0x0D ? '\uFFFD' : x.frCoPt(num);

                return skipReplacement ? fromCodePoint(num)
                        : num === 0x80 ? '\u20AC'  // EURO SIGN (€)
                        : num === 0x82 ? '\u201A'  // SINGLE LOW-9 QUOTATION MARK (‚)
                        : num === 0x83 ? '\u0192'  // LATIN SMALL LETTER F WITH HOOK (ƒ)
                        : num === 0x84 ? '\u201E'  // DOUBLE LOW-9 QUOTATION MARK („)
                        : num === 0x85 ? '\u2026'  // HORIZONTAL ELLIPSIS (…)
                        : num === 0x86 ? '\u2020'  // DAGGER (†)
                        : num === 0x87 ? '\u2021'  // DOUBLE DAGGER (‡)
                        : num === 0x88 ? '\u02C6'  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
                        : num === 0x89 ? '\u2030'  // PER MILLE SIGN (‰)
                        : num === 0x8A ? '\u0160'  // LATIN CAPITAL LETTER S WITH CARON (Š)
                        : num === 0x8B ? '\u2039'  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
                        : num === 0x8C ? '\u0152'  // LATIN CAPITAL LIGATURE OE (Œ)
                        : num === 0x8E ? '\u017D'  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
                        : num === 0x91 ? '\u2018'  // LEFT SINGLE QUOTATION MARK (‘)
                        : num === 0x92 ? '\u2019'  // RIGHT SINGLE QUOTATION MARK (’)
                        : num === 0x93 ? '\u201C'  // LEFT DOUBLE QUOTATION MARK (“)
                        : num === 0x94 ? '\u201D'  // RIGHT DOUBLE QUOTATION MARK (”)
                        : num === 0x95 ? '\u2022'  // BULLET (•)
                        : num === 0x96 ? '\u2013'  // EN DASH (–)
                        : num === 0x97 ? '\u2014'  // EM DASH (—)
                        : num === 0x98 ? '\u02DC'  // SMALL TILDE (˜)
                        : num === 0x99 ? '\u2122'  // TRADE MARK SIGN (™)
                        : num === 0x9A ? '\u0161'  // LATIN SMALL LETTER S WITH CARON (š)
                        : num === 0x9B ? '\u203A'  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
                        : num === 0x9C ? '\u0153'  // LATIN SMALL LIGATURE OE (œ)
                        : num === 0x9E ? '\u017E'  // LATIN SMALL LETTER Z WITH CARON (ž)
                        : num === 0x9F ? '\u0178'  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
                        : (num >= 0xD800 && num <= 0xDFFF) || num === 0x0D ? '\uFFFD'
                        : x.frCoPt(num);
            }
            return namedRefMap[named || named1] || m;
        }

        return s === undefined  ? 'undefined'
            : s === null        ? 'null'
            : s.toString().replace(NULL, '\uFFFD').replace(reNamedRef, regExpFunction);
    }

    function cssEncode(chr) {
        // space after \\HEX is needed by spec
        return '\\' + chr.charCodeAt(0).toString(16).toLowerCase() + ' ';
    }
    function cssBlacklist(s) {
        return s.replace(CSS_BLACKLIST, function(m){ return '-x-' + m; });
    }
    function cssUrl(s) {
        // encodeURI() in yufull() will throw error for use of the CSS_UNSUPPORTED_CODE_POINT (i.e., [\uD800-\uDFFF])
        s = x.yufull(htmlDecode(s));
        var protocol = getProtocol(s);

        // prefix ## for blacklisted protocols
        // here .replace(URI_PROTOCOL_WHITESPACES, '') is not needed since yufull has already percent-encoded the whitespaces
        return (protocol && URI_BLACKLIST_PROTOCOLS[protocol.toLowerCase()]) ? '##' + s : s;
    }

    return (x = {
        // turn invalid codePoints and that of non-characters to \uFFFD, and then fromCodePoint()
        frCoPt: function(num) {
            return num === undefined || num === null ? '' :
                !isFinite(num = Number(num)) || // `NaN`, `+Infinity`, or `-Infinity`
                num <= 0 ||                     // not a valid Unicode code point
                num > 0x10FFFF ||               // not a valid Unicode code point
                // Math.floor(num) != num || 

                (num >= 0x01 && num <= 0x08) ||
                (num >= 0x0E && num <= 0x1F) ||
                (num >= 0x7F && num <= 0x9F) ||
                (num >= 0xFDD0 && num <= 0xFDEF) ||
                
                 num === 0x0B || 
                (num & 0xFFFF) === 0xFFFF || 
                (num & 0xFFFF) === 0xFFFE ? '\uFFFD' : fromCodePoint(num);
        },
        d: htmlDecode,
        /*
         * @param {string} s - An untrusted uri input
         * @returns {string} s - null if relative url, otherwise the protocol with whitespaces stripped and lower-cased
         */
        yup: function(s) {
            s = getProtocol(s.replace(NULL, ''));
            // URI_PROTOCOL_WHITESPACES is required for left trim and remove interim whitespaces
            return s ? htmlDecode(s, URI_PROTOCOL_NAMED_REF_MAP, null, true).replace(URI_PROTOCOL_WHITESPACES, '').toLowerCase() : null;
        },

        /*
         * @deprecated
         * @param {string} s - An untrusted user input
         * @returns {string} s - The original user input with & < > " ' ` encoded respectively as &amp; &lt; &gt; &quot; &#39; and &#96;.
         *
         */
        y: function(s) {
            return strReplace(s, SPECIAL_HTML_CHARS, function (m) {
                return m === '&' ? '&amp;'
                    :  m === '<' ? '&lt;'
                    :  m === '>' ? '&gt;'
                    :  m === '"' ? '&quot;'
                    :  m === "'" ? '&#39;'
                    :  /*m === '`'*/ '&#96;';       // in hex: 60
            });
        },

        // This filter is meant to introduce double-encoding, and should be used with extra care.
        ya: function(s) {
            return strReplace(s, AMP, '&amp;');
        },

        // FOR DETAILS, refer to inHTMLData()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#data-state
        yd: function (s) {
            return strReplace(s, LT, '&lt;');
        },

        // FOR DETAILS, refer to inHTMLComment()
        // All NULL characters in s are first replaced with \uFFFD.
        // If s contains -->, --!>, or starts with -*>, insert a space right before > to stop state breaking at <!--{{{yc s}}}-->
        // If s ends with --!, --, or -, append a space to stop collaborative state breaking at {{{yc s}}}>, {{{yc s}}}!>, {{{yc s}}}-!>, {{{yc s}}}->
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#comment-state
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-3
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-0021
        // If s contains ]> or ends with ], append a space after ] is verified in IE to stop IE conditional comments.
        // Reference: http://msdn.microsoft.com/en-us/library/ms537512%28v=vs.85%29.aspx
        // We do not care --\s>, which can possibly be intepreted as a valid close comment tag in very old browsers (e.g., firefox 3.6), as specified in the html4 spec
        // Reference: http://www.w3.org/TR/html401/intro/sgmltut.html#h-3.2.4
        yc: function (s) {
            return strReplace(s, SPECIAL_COMMENT_CHARS, function(m){
                return m === '\x00' ? '\uFFFD'
                    : m === '--!' || m === '--' || m === '-' || m === ']' ? m + ' '
                    :/*
                    :  m === ']>'   ? '] >'
                    :  m === '-->'  ? '-- >'
                    :  m === '--!>' ? '--! >'
                    : /-*!?>/.test(m) ? */ m.slice(0, -1) + ' >';
            });
        },

        // FOR DETAILS, refer to inDoubleQuotedAttr()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state
        yavd: function (s) {
            return strReplace(s, QUOT, '&quot;');
        },

        // FOR DETAILS, refer to inSingleQuotedAttr()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state
        yavs: function (s) {
            return strReplace(s, SQUOT, '&#39;');
        },

        // FOR DETAILS, refer to inUnQuotedAttr()
        // PART A.
        // if s contains any state breaking chars (\t, \n, \v, \f, \r, space, and >),
        // they are escaped and encoded into their equivalent HTML entity representations. 
        // Reference: http://shazzer.co.uk/database/All/Characters-which-break-attributes-without-quotes
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
        //
        // PART B. 
        // if s starts with ', " or `, encode it resp. as &#39;, &quot;, or &#96; to 
        // enforce the attr value (unquoted) state
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-value-state
        // Reference: http://shazzer.co.uk/vector/Characters-allowed-attribute-quote
        // 
        // PART C.
        // Inject a \uFFFD character if an empty or all null string is encountered in 
        // unquoted attribute value state.
        // 
        // Rationale 1: our belief is that developers wouldn't expect an 
        //   empty string would result in ' name="passwd"' rendered as 
        //   attribute value, even though this is how HTML5 is specified.
        // Rationale 2: an empty or all null string (for IE) can 
        //   effectively alter its immediate subsequent state, we choose
        //   \uFFFD to end the unquoted attr 
        //   state, which therefore will not mess up later contexts.
        // Rationale 3: Since IE 6, it is verified that NULL chars are stripped.
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
        // 
        // Example:
        // <input value={{{yavu s}}} name="passwd"/>
        yavu: function (s) {
            return strReplace(s, SPECIAL_ATTR_VALUE_UNQUOTED_CHARS, function (m) {
                return m === '\t'   ? '&#9;'  // in hex: 09
                    :  m === '\n'   ? '&#10;' // in hex: 0A
                    :  m === '\x0B' ? '&#11;' // in hex: 0B  for IE. IE<9 \v equals v, so use \x0B instead
                    :  m === '\f'   ? '&#12;' // in hex: 0C
                    :  m === '\r'   ? '&#13;' // in hex: 0D
                    :  m === ' '    ? '&#32;' // in hex: 20
                    :  m === '='    ? '&#61;' // in hex: 3D
                    :  m === '<'    ? '&lt;'
                    :  m === '>'    ? '&gt;'
                    :  m === '"'    ? '&quot;'
                    :  m === "'"    ? '&#39;'
                    :  m === '`'    ? '&#96;'
                    : /*empty or null*/ '\uFFFD';
            });
        },

        yu: encodeURI,
        yuc: encodeURIComponent,

        // Notice that yubl MUST BE APPLIED LAST, and will not be used independently (expected output from encodeURI/encodeURIComponent and yavd/yavs/yavu)
        // This is used to disable JS execution capabilities by prefixing x- to ^javascript:, ^vbscript: or ^data: that possibly could trigger script execution in URI attribute context
        yubl: function (s) {
            return URI_BLACKLIST_PROTOCOLS[x.yup(s)] ? 'x-' + s : s;
        },

        // This is NOT a security-critical filter.
        // Reference: https://tools.ietf.org/html/rfc3986
        yufull: function (s) {
            return x.yu(s).replace(URL_IPV6, function(m, p) {
                return '//[' + p + ']';
            });
        },

        // chain yufull() with yubl()
        yublf: function (s) {
            return x.yubl(x.yufull(s));
        },

        // The design principle of the CSS filter MUST meet the following goal(s).
        // (1) The input cannot break out of the context (expr) and this is to fulfill the just sufficient encoding principle.
        // (2) The input cannot introduce CSS parsing error and this is to address the concern of UI redressing.
        //
        // term
        //   : unary_operator?
        //     [ NUMBER S* | PERCENTAGE S* | LENGTH S* | EMS S* | EXS S* | ANGLE S* |
        //     TIME S* | FREQ S* ]
        //   | STRING S* | IDENT S* | URI S* | hexcolor | function
        // 
        // Reference:
        // * http://www.w3.org/TR/CSS21/grammar.html 
        // * http://www.w3.org/TR/css-syntax-3/
        // 
        // NOTE: delimiter in CSS -  \  _  :  ;  (  )  "  '  /  ,  %  #  !  *  @  .  {  }
        //                        2d 5c 5f 3a 3b 28 29 22 27 2f 2c 25 23 21 2a 40 2e 7b 7d

        yceu: function(s) {
            s = htmlDecode(s);
            return CSS_VALID_VALUE.test(s) ? s : ";-x:'" + cssBlacklist(s.replace(CSS_SINGLE_QUOTED_CHARS, cssEncode)) + "';-v:";
        },

        // string1 = \"([^\n\r\f\\"]|\\{nl}|\\[^\n\r\f0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*\"
        yced: function(s) {
            return cssBlacklist(htmlDecode(s).replace(CSS_DOUBLE_QUOTED_CHARS, cssEncode));
        },

        // string2 = \'([^\n\r\f\\']|\\{nl}|\\[^\n\r\f0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*\'
        yces: function(s) {
            return cssBlacklist(htmlDecode(s).replace(CSS_SINGLE_QUOTED_CHARS, cssEncode));
        },

        // for url({{{yceuu url}}}
        // unquoted_url = ([!#$%&*-~]|\\{h}{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])* (CSS 2.1 definition)
        // unquoted_url = ([^"'()\\ \t\n\r\f\v\u0000\u0008\u000b\u000e-\u001f\u007f]|\\{h}{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])* (CSS 3.0 definition)
        // The state machine in CSS 3.0 is more well defined - http://www.w3.org/TR/css-syntax-3/#consume-a-url-token0
        // CSS_UNQUOTED_URL = /['\(\)]/g; // " \ treated by encodeURI()   
        yceuu: function(s) {
            return cssUrl(s).replace(CSS_UNQUOTED_URL, function (chr) {
                return  chr === '\''        ? '\\27 ' :
                        chr === '('         ? '%28' :
                        /* chr === ')' ? */   '%29';
            });
        },

        // for url("{{{yceud url}}}
        yceud: function(s) { 
            return cssUrl(s);
        },

        // for url('{{{yceus url}}}
        yceus: function(s) { 
            return cssUrl(s).replace(SQUOT, '\\27 ');
        }
    });
};

// exposing privFilters
// this is an undocumented feature, and please use it with extra care
var privFilters = exports._privFilters = exports._getPrivFilters();


/* chaining filters */

// uriInAttr and literally uriPathInAttr
// yubl is always used 
// Rationale: given pattern like this: <a href="{{{uriPathInDoubleQuotedAttr s}}}">
//            developer may expect s is always prefixed with ? or /, but an attacker can abuse it with 'javascript:alert(1)'
function uriInAttr (s, yav, yu) {
    return privFilters.yubl(yav((yu || privFilters.yufull)(s)));
}

/** 
* Yahoo Secure XSS Filters - just sufficient output filtering to prevent XSS!
* @module xss-filters 
*/

/**
* @function module:xss-filters#inHTMLData
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with '<' encoded as '&amp;lt;'
*
* @description
* This filter is to be placed in HTML Data context to encode all '<' characters into '&amp;lt;'
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <div>{{{inHTMLData htmlData}}}</div>
*
*/
exports.inHTMLData = privFilters.yd;

/**
* @function module:xss-filters#inHTMLComment
*
* @param {string} s - An untrusted user input
* @returns {string} All NULL characters in s are first replaced with \uFFFD. If s contains -->, --!>, or starts with -*>, insert a space right before > to stop state breaking at <!--{{{yc s}}}-->. If s ends with --!, --, or -, append a space to stop collaborative state breaking at {{{yc s}}}>, {{{yc s}}}!>, {{{yc s}}}-!>, {{{yc s}}}->. If s contains ]> or ends with ], append a space after ] is verified in IE to stop IE conditional comments.
*
* @description
* This filter is to be placed in HTML Comment context
* <ul>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-3">Shazzer - Closing comments for -.-></a>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment">Shazzer - Closing comments for --.></a>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-0021">Shazzer - Closing comments for .></a>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-start-state">HTML5 Comment Start State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-start-dash-state">HTML5 Comment Start Dash State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-dash-state">HTML5 Comment End Dash State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-state">HTML5 Comment End State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-bang-state">HTML5 Comment End Bang State</a></li>
* <li><a href="http://msdn.microsoft.com/en-us/library/ms537512%28v=vs.85%29.aspx">Conditional Comments in Internet Explorer</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- {{{inHTMLComment html_comment}}} -->
*
*/
exports.inHTMLComment = privFilters.yc;

/**
* @function module:xss-filters#inSingleQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with any single-quote characters encoded into '&amp;&#39;'.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InSingleQuotedAttr filter </p>
* This filter is to be placed in HTML Attribute Value (single-quoted) state to encode all single-quote characters into '&amp;&#39;'
*
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name='firstname' value='{{{inSingleQuotedAttr firstname}}}' />
*
*/
exports.inSingleQuotedAttr = privFilters.yavs;

/**
* @function module:xss-filters#inDoubleQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with any single-quote characters encoded into '&amp;&quot;'.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InDoubleQuotedAttr filter </p>
* This filter is to be placed in HTML Attribute Value (double-quoted) state to encode all single-quote characters into '&amp;&quot;'
*
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name="firstname" value="{{{inDoubleQuotedAttr firstname}}}" />
*
*/
exports.inDoubleQuotedAttr = privFilters.yavd;

/**
* @function module:xss-filters#inUnQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} If s contains any state breaking chars (\t, \n, \v, \f, \r, space, null, ', ", `, <, >, and =), they are escaped and encoded into their equivalent HTML entity representations. If the string is empty, inject a \uFFFD character.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InUnQuotedAttr filter </p>
* <p>Regarding \uFFFD injection, given <a id={{{id}}} name="passwd">,<br/>
*        Rationale 1: our belief is that developers wouldn't expect when id equals an
*          empty string would result in ' name="passwd"' rendered as 
*          attribute value, even though this is how HTML5 is specified.<br/>
*        Rationale 2: an empty or all null string (for IE) can 
*          effectively alter its immediate subsequent state, we choose
*          \uFFFD to end the unquoted attr 
*          state, which therefore will not mess up later contexts.<br/>
*        Rationale 3: Since IE 6, it is verified that NULL chars are stripped.<br/>
*        Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state</p>
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-value-state">HTML5 Before Attribute Value State</a></li>
* <li><a href="http://shazzer.co.uk/database/All/Characters-which-break-attributes-without-quotes">Shazzer - Characters-which-break-attributes-without-quotes</a></li>
* <li><a href="http://shazzer.co.uk/vector/Characters-allowed-attribute-quote">Shazzer - Characters-allowed-attribute-quote</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name="firstname" value={{{inUnQuotedAttr firstname}}} />
*
*/
exports.inUnQuotedAttr = privFilters.yavu;


/**
* @function module:xss-filters#uriInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='{{{uriInSingleQuotedAttr full_uri}}}'>link</a>
* 
*/
exports.uriInSingleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavs);
};

/**
* @function module:xss-filters#uriInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="{{{uriInDoubleQuotedAttr full_uri}}}">link</a>
* 
*/
exports.uriInDoubleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavd);
};


/**
* @function module:xss-filters#uriInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first the built-in encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href={{{uriInUnQuotedAttr full_uri}}}>link</a>
* 
*/
exports.uriInUnQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavu);
};

/**
* @function module:xss-filters#uriInHTMLData
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded by window.encodeURI() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for an <strong>absolute</strong> URI.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURI().</p>
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="/somewhere">{{{uriInHTMLData full_uri}}}</a>
* 
*/
exports.uriInHTMLData = privFilters.yufull;


/**
* @function module:xss-filters#uriInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded by window.encodeURI(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for an <strong>absolute</strong> URI.
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- {{{uriInHTMLComment full_uri}}} -->
* 
*/
exports.uriInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yufull(s));
};




/**
* @function module:xss-filters#uriPathInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/{{{uriPathInSingleQuotedAttr uri_path}}}'>link</a>
* <a href='http://example.com/?{{{uriQueryInSingleQuotedAttr uri_query}}}'>link</a>
* 
*/
exports.uriPathInSingleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavs, privFilters.yu);
};

/**
* @function module:xss-filters#uriPathInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/{{{uriPathInDoubleQuotedAttr uri_path}}}">link</a>
* <a href="http://example.com/?{{{uriQueryInDoubleQuotedAttr uri_query}}}">link</a>
* 
*/
exports.uriPathInDoubleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavd, privFilters.yu);
};


/**
* @function module:xss-filters#uriPathInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first the built-in encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/{{{uriPathInUnQuotedAttr uri_path}}}>link</a>
* <a href=http://example.com/?{{{uriQueryInUnQuotedAttr uri_query}}}>link</a>
* 
*/
exports.uriPathInUnQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavu, privFilters.yu);
};

/**
* @function module:xss-filters#uriPathInHTMLData
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded by window.encodeURI() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for a URI Path/Query or relative URI.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURI().</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/">http://example.com/{{{uriPathInHTMLData uri_path}}}</a>
* <a href="http://example.com/">http://example.com/?{{{uriQueryInHTMLData uri_query}}}</a>
* 
*/
exports.uriPathInHTMLData = privFilters.yu;


/**
* @function module:xss-filters#uriPathInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded by window.encodeURI(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for a URI Path/Query or relative URI.
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- http://example.com/{{{uriPathInHTMLComment uri_path}}} -->
* <!-- http://example.com/?{{{uriQueryInHTMLComment uri_query}}} -->
*/
exports.uriPathInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yu(s));
};


/**
* @function module:xss-filters#uriQueryInSingleQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInSingleQuotedAttr}
* 
* @alias module:xss-filters#uriPathInSingleQuotedAttr
*/
exports.uriQueryInSingleQuotedAttr = exports.uriPathInSingleQuotedAttr;

/**
* @function module:xss-filters#uriQueryInDoubleQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInDoubleQuotedAttr}
* 
* @alias module:xss-filters#uriPathInDoubleQuotedAttr
*/
exports.uriQueryInDoubleQuotedAttr = exports.uriPathInDoubleQuotedAttr;

/**
* @function module:xss-filters#uriQueryInUnQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInUnQuotedAttr}
* 
* @alias module:xss-filters#uriPathInUnQuotedAttr
*/
exports.uriQueryInUnQuotedAttr = exports.uriPathInUnQuotedAttr;

/**
* @function module:xss-filters#uriQueryInHTMLData
* @description This is an alias of {@link module:xss-filters#uriPathInHTMLData}
* 
* @alias module:xss-filters#uriPathInHTMLData
*/
exports.uriQueryInHTMLData = exports.uriPathInHTMLData;

/**
* @function module:xss-filters#uriQueryInHTMLComment
* @description This is an alias of {@link module:xss-filters#uriPathInHTMLComment}
* 
* @alias module:xss-filters#uriPathInHTMLComment
*/
exports.uriQueryInHTMLComment = exports.uriPathInHTMLComment;



/**
* @function module:xss-filters#uriComponentInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inSingleQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inSingleQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/?q={{{uriComponentInSingleQuotedAttr uri_component}}}'>link</a>
* 
*/
exports.uriComponentInSingleQuotedAttr = function (s) {
    return privFilters.yavs(privFilters.yuc(s));
};

/**
* @function module:xss-filters#uriComponentInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inDoubleQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inDoubleQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/?q={{{uriComponentInDoubleQuotedAttr uri_component}}}">link</a>
* 
*/
exports.uriComponentInDoubleQuotedAttr = function (s) {
    return privFilters.yavd(privFilters.yuc(s));
};


/**
* @function module:xss-filters#uriComponentInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inUnQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first the built-in encodeURIComponent(), then inUnQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/?q={{{uriComponentInUnQuotedAttr uri_component}}}>link</a>
* 
*/
exports.uriComponentInUnQuotedAttr = function (s) {
    return privFilters.yavu(privFilters.yuc(s));
};

/**
* @function module:xss-filters#uriComponentInHTMLData
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded by window.encodeURIComponent() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for a URI Component.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURIComponent().</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/">http://example.com/?q={{{uriComponentInHTMLData uri_component}}}</a>
* <a href="http://example.com/">http://example.com/#{{{uriComponentInHTMLData uri_fragment}}}</a>
* 
*/
exports.uriComponentInHTMLData = privFilters.yuc;


/**
* @function module:xss-filters#uriComponentInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded by window.encodeURIComponent(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for a URI Component.
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- http://example.com/?q={{{uriComponentInHTMLComment uri_component}}} -->
* <!-- http://example.com/#{{{uriComponentInHTMLComment uri_fragment}}} -->
*/
exports.uriComponentInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yuc(s));
};


// uriFragmentInSingleQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href='{{{uriFragmentInSingleQuotedAttr s}}}'>
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/#{{{uriFragmentInSingleQuotedAttr uri_fragment}}}'>link</a>
* 
*/
exports.uriFragmentInSingleQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavs(privFilters.yuc(s)));
};

// uriFragmentInDoubleQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href="{{{uriFragmentInDoubleQuotedAttr s}}}">
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/#{{{uriFragmentInDoubleQuotedAttr uri_fragment}}}">link</a>
* 
*/
exports.uriFragmentInDoubleQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavd(privFilters.yuc(s)));
};

// uriFragmentInUnQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href={{{uriFragmentInUnQuotedAttr s}}}>
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first the built-in encodeURIComponent(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/#{{{uriFragmentInUnQuotedAttr uri_fragment}}}>link</a>
* 
*/
exports.uriFragmentInUnQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavu(privFilters.yuc(s)));
};


/**
* @function module:xss-filters#uriFragmentInHTMLData
* @description This is an alias of {@link module:xss-filters#uriComponentInHTMLData}
* 
* @alias module:xss-filters#uriComponentInHTMLData
*/
exports.uriFragmentInHTMLData = exports.uriComponentInHTMLData;

/**
* @function module:xss-filters#uriFragmentInHTMLComment
* @description This is an alias of {@link module:xss-filters#uriComponentInHTMLComment}
* 
* @alias module:xss-filters#uriComponentInHTMLComment
*/
exports.uriFragmentInHTMLComment = exports.uriComponentInHTMLComment;

},{}],5:[function(require,module,exports){
'use strict';


var m = require('mithril');


var state = {
  appTitle: 'Conduit',
  selectedArticles: {
    isLoading: false,
    list: null,
    author: '',
    favorited: '',
    limit: 10,
    offset: 0,
    total: 0,
    type: {
      name: 'GLOBAL',
      label: 'Global Feed'
    },
  },
  articleListTypes: {
    GLOBAL: {
      name: 'GLOBAL',
      label: 'Global Feed'
    },
    USER_FAVORITED: {
      name: 'USER_FAVORITED',
      label: 'Your Feed'
    },
    USER_OWNED: {
      name: 'USER_OWNED',
      label: 'My Articles'
    }
  },
  articlesByTag: {},
  tags: {},
  selectedArticle: {
    data: null,
    isLoading: false
  },
  selectedArticleComments: {
    data: null,
    isLoading: false
  },
  isArticleCommentCreationBusy: false,
  userAuthorizationToken: null,
  isUserLoginBusy: false,
  userLoginErrors: null,
  isUserRegistrationBusy: false,
  userRegistrationErrors: null,
  isUserSettingsUpdateBusy: false,
  userUpdateSettingsErrors: null,
  isCreateArticleBusy: false,
  createArticleErrors: null,
  isDeleteArticleBusy: false,
  user: null,
  selectedUserProfile: {
    data: null,
    isLoading: false
  }
};


var API_BASE_URI = '//conduit.productionready.io/api';


function init() {
  actions.getLoggedInUser(window.localStorage.getItem('jwt'));
}


function getErrorMessageFromAPIErrorObject(e) {
  var response = null;

  try {
    response = JSON.parse(e.message).errors;
  } catch (error) {
    response = {
      'An unhandled error occurred': []
    };
  }

  return response;
}


function redirectToPreviousPageOrHome() {
  if (window.history.length > 0) {
    window.history.back();
  } else {
    m.route.set('/');
  }
}


function getArticles(payload) {
	/*
	TODO

	Filter by author:

	?author=jake

	Favorited by user:

	?favorited=jake

	Limit number of articles (default is 20):

	?limit=20

	Offset/skip number of articles (default is 0):

	?offset=0
	*/

  // if (!payload) {
  // 	payload = {
  // 		limit: 3
  // 	};
  // }

  var queryString = m.buildQueryString(payload);

  return m.request({
    method: 'GET',
    url: API_BASE_URI + '/articles?' + queryString
  })
    .then(function (response) {
      // return []; // Test empty response
      return response;
    });
}


function isValueNullOrUndefined(value) {
  return (value === null) || typeof value === 'undefined';
}


function getValueFromSuppliedOrOther(supplied, other) {
  return !isValueNullOrUndefined(supplied) ? supplied : other;
}


function setupSelectedArticlesStateForRequest(payload, selectedArticles) {
  var selectedArticles = {
    isLoading: true,
    list: null,
    total: 0,
    type: getValueFromSuppliedOrOther(payload.type, state.articleListTypes.type),
    limit: getValueFromSuppliedOrOther(payload.limit, state.articleListTypes.limit),
    offset: getValueFromSuppliedOrOther(payload.offset, state.articleListTypes.offset),
    author: getValueFromSuppliedOrOther(payload.author, state.articleListTypes.author),
    favorited: getValueFromSuppliedOrOther(payload.favorited, state.articleListTypes.favorited)
  };

  return selectedArticles;
}



var actions = {

  setCurrentlyActiveArticles: function (payload) {
    var request = {};
    payload = payload || {};

    state.selectedArticles = setupSelectedArticlesStateForRequest(payload);

    request.limit = state.selectedArticles.limit;
    request.offset = state.selectedArticles.offset;
    request.author = state.selectedArticles.author;
    request.favorited = state.selectedArticles.favorited;

    console.info('domain.setCurrentlyActiveArticles()', payload, request);

    return getArticles(request)
      .then(function (response) {
        state.selectedArticles.list = response.articles;
        state.selectedArticles.total = response.articlesCount;
        state.selectedArticles.isLoading = false;
      });
  },


  getArticlesByTag: function (tag) {
    return getArticles({ tag: tag })
      .then(function (response) {
        state.articlesByTag.tag = tag;
        state.articlesByTag.list = response.articles;
      });
  },


  setSelectedArticle: function (slug) {
    state.selectedArticle.data = null;
    state.selectedArticle.isLoading = true;

    return m.request({
      method: 'GET',
      url: API_BASE_URI + '/articles/' + slug
    })
      .then(function (response) {
        state.selectedArticle.data = response.article;
      })
      .then(function () {
        state.selectedArticle.isLoading = false;
      });
  },


  setSelectedArticleComments: function (slug) {
    state.selectedArticleComments.data = null;
    state.selectedArticleComments.isLoading = true;

    return m.request({
      method: 'GET',
      url: API_BASE_URI + '/articles/' + slug + '/comments'
    })
      .then(function (response) {
        state.selectedArticleComments.data = response.comments;
      })
      .then(function () {
        state.selectedArticleComments.isLoading = true;
      });
  },


  createArticle: function (payload) {
    state.isCreateArticleBusy = true;
    state.createArticleErrors = null;

    // Format tagList before sending to API
    var tagList = payload.tagList
      .split(',')
      .join('-|-')
      .split(' ')
      .join('-|-')
      .split('-|-')
      .filter(function (tag) {
        return tag !== '';
      });

    m.request({
      method: 'POST',
      url: API_BASE_URI + '/articles',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
      data: {
        article: {
          title: payload.title,
          description: payload.description,
          body: payload.body,
          tagList: tagList
        }
      }
    })
      .then(function (response) {
        state.createArticleErrors = null;
        state.newArticle = response.article;
        m.route.set('/article/' + state.newArticle.slug);
      })
      .catch(function (e) {
        state.createArticleErrors = getErrorMessageFromAPIErrorObject(e);
      })
      .then(function () {
        state.isCreateArticleBusy = false;
      });
  },


  deleteArticle: function (slug) {
    state.isDeleteArticleBusy = true;
    m.redraw(); // This shouldn't be necessary

    m.request({
      method: 'DELETE',
      url: API_BASE_URI + '/articles/' + slug,
      headers: {
        'Authorization': 'Token ' + state.user.token
      }
    })
      .then(function (response) {
        console.info(response);
        state.isDeleteArticleBusy = false;
        // if (response) {
        redirectToPreviousPageOrHome();
        // }
      })
      .catch(function (e) {
        state.isDeleteArticleBusy = false;
        console.warn(getErrorMessageFromAPIErrorObject(e));
      });
  },


  createArticleComment: function (payload) {
    state.isArticleCommentCreationBusy = true;

    m.request({
      method: 'POST',
      url: API_BASE_URI + '/articles/' + payload.articleSlug + '/comments',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
      data: {
        comment: {
          body: payload.body
        }
      }
    })
      .then(function () {
        state.isArticleCommentCreationBusy = false;
      })
      .then(function () {
        actions.setSelectedArticleComments(payload.articleSlug);
      });
  },


  goToArticleEditScreen: function (articleSlug) {
    m.route.set('/editor/' + articleSlug);
  },


  registerNewUser: function (payload) {
    state.isUserRegistrationBusy = true;
    state.userRegistrationErrors = null;

    m.request({
      method: 'POST',
      url: API_BASE_URI + '/users',
      data: {
        user: {
          email: payload.email,
          password: payload.password,
          username: payload.username
        }
      }
    })
      .then(function (response) {
        state.userRegistrationErrors = null;
        state.user = response.user;
        window.localStorage.setItem('jwt', state.user.token);
      })
      .catch(function (e) {
        state.userRegistrationErrors = getErrorMessageFromAPIErrorObject(e);
      })
      .then(function () {
        state.isUserRegistrationBusy = false;
      });
  },


  attemptUserLogin: function (email, password) {
    window.localStorage.setItem('jwt', null);
    state.user = null;
    state.isUserLoginBusy = true;
    state.userLoginErrors = null;

    m.request({
      method: 'POST',
      url: API_BASE_URI + '/users/login',
      data: {
        user: {
          email: email,
          password: password
        }
      }
    })
      .then(function (response) {
        state.userLoginErrors = null;
        state.user = response.user;
        window.localStorage.setItem('jwt', state.user.token);
      })
      .catch(function (e) {
        state.userLoginErrors = getErrorMessageFromAPIErrorObject(e);
      })
      .then(function () {
        state.isUserLoginBusy = false;
      });
  },


  redirectAfterUserLoginSuccess: function () {
    redirectToPreviousPageOrHome();
  },


  redirectAfterUserRegistrationSuccess: function () {
    redirectToPreviousPageOrHome();
  },


  getLoggedInUser: function (token) {
    var userToken = state.user ? state.user.token : '';

    if (token) {
      userToken = token;
    }

    m.request({
      method: 'GET',
      url: API_BASE_URI + '/user',
      headers: {
        'Authorization': 'Token ' + userToken
      }
    })
      .then(function (response) {
        state.user = response.user;
      })
      .catch(function (e) {
        console.warn('domain.getLoggedInUser()', e, getErrorMessageFromAPIErrorObject(e));
      });
  },


  updateUserSettings: function (payload) {
    state.isUserSettingsUpdateBusy = true;
    state.userUpdateSettingsErrors = null;

    if (!payload.password) {
      delete payload.password;
    }

    m.request({
      method: 'PUT',
      url: API_BASE_URI + '/user',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
      data: {
        user: payload
      }
    })
      .then(function (response) {
        state.user = response.user;
      })
      .catch(function (e) {
        state.userUpdateSettingsErrors = getErrorMessageFromAPIErrorObject(e);
      })
      .then(function () {
        state.isUserSettingsUpdateBusy = false;
      });
  },


  getUserProfile: function (username) {
    state.selectedUserProfile.isLoading = true;
    state.selectedUserProfile.data = null;

    m.request({
      method: 'GET',
      url: API_BASE_URI + '/profiles/' + username
    })
      .then(function (response) {
        state.selectedUserProfile.data = response.profile;
      })
      .then(function () {
        state.selectedUserProfile.isLoading = false;
      });
  },


  followUser: function (username) {
    return alert('followUser() -> ' + username);
    m.request({
      method: 'POST',
      url: API_BASE_URI + '/profiles/' + username + '/follow',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
    })
      .then(function () {
        // TODO
      });
  },


  unfollowUser: function (username) {
    return alert('unfollowUser() -> ' + username);
    m.request({
      method: 'DELETE',
      url: API_BASE_URI + '/profiles/' + username + '/follow',
      headers: {
        'Authorization': 'Token ' + state.user.token
      },
    })
      .then(function () {
        // TODO
      });
  },


  logUserOut: function () {
    state.user = null;
    window.localStorage.setItem('jwt', null);
    m.route.set('/');
  },


  getTags: function () {
    state.tags.isLoading = true;

    m.request({
      method: 'GET',
      url: API_BASE_URI + '/tags',
    })
      .then(function (response) {
        state.tags.list = response.tags;
      })
      .then(function () {
        state.tags.isLoading = false;
      });
  }

};


module.exports = {
  init: init,
  store: state,
  actions: actions
};

},{"mithril":3}],6:[function(require,module,exports){
'use strict';


require('./domain').init();
require('./ui/router').init();

},{"./domain":5,"./ui/router":41}],7:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view() {
  return m('footer',
    m('.container', [
      m('a.logo-font', { href: '/' }, 'conduit'),
      m('span.attribution',
        m.trust('An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.')
      )
    ])
  );
};


module.exports = {
  view: view
};

},{"mithril":3}],8:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var MainNav = require('./MainNav');
var Link = require('./Link');


function view() {
  return m('header',
    m('nav.navbar.navbar-light',
      m('.container',
        m(Link, { className: 'navbar-brand pull-xs-none pull-md-left', to: '/' }, 'conduit'),
        m(MainNav, { className: 'nav navbar-nav pull-xs-none pull-md-right text-xs-center', currentUser: domain.store.user })
      )
    )
  );
};


module.exports = {
  view: view
};

},{"./../../domain":5,"./Link":23,"./MainNav":25,"mithril":3}],9:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var ArticleFavoriteButton = require('./ArticleFavoriteButton');
var ArticleUpdateButton = require('./ArticleUpdateButton');
var ArticleDeleteButton = require('./ArticleDeleteButton');
var UserFollowUnfollowButton = require('./UserFollowUnfollowButton');


function updateState(vnode) {
  vnode.state = {
    article: vnode.attrs.article.data,
    isDeleteArticleBusy: domain.store.isDeleteArticleBusy
  };
}


function oninit(vnode) {
  updateState(vnode);
}


function onupdate(vnode) {
  updateState(vnode);
}


function view(vnode) {
  var article = vnode.attrs.article.data ? vnode.attrs.article.data : {
    author: {
      username: null
    }
  };

  var loggedInUsername = domain.store.user ? domain.store.user.username : '';

  return [
    m(ArticleUpdateButton, { action: domain.actions.goToArticleEditScreen.bind(null, article.slug) }),
    m('span', ' '),
    m(ArticleDeleteButton, { action: domain.actions.deleteArticle.bind(null, article.slug) }),
    m('span', ' '),
    m(UserFollowUnfollowButton, { isFollowing: article.author.following, username: article.author.username, loggedInUsername: loggedInUsername }),
    m('span', ' '),
    m(ArticleFavoriteButton, { article: article })
  ];
};


module.exports = {
  oninit: oninit,
  onupdate: onupdate,
  view: view
};

},{"./../../domain":5,"./ArticleDeleteButton":12,"./ArticleFavoriteButton":13,"./ArticleUpdateButton":18,"./UserFollowUnfollowButton":33,"mithril":3}],10:[function(require,module,exports){
'use strict';


var m = require('mithril');


var ArticleMetaAndActions = require('./ArticleMetaAndActions');


function view(vnode) {
  var title = vnode.attrs.article.data ? vnode.attrs.article.data.title : '...';

  return m('div', [
    m('h1', title),
    m(ArticleMetaAndActions, { article: vnode.attrs.article })
  ]);
};


module.exports = {
  view: view
};

},{"./ArticleMetaAndActions":16,"mithril":3}],11:[function(require,module,exports){
'use strict';


var m = require('mithril');


var utils = require('./../utils');
var TagList = require('./TagList');


function view(vnode) {
  var article = vnode.attrs.article.data;
  var content = m('div', '...');

  if (article) {
    content = [
      m('div.col-xs-12', [
        m('div', m.trust(utils.convertMarkdownToHTML(article.body))),
        m(TagList, { list: article.tagList, style: TagList.styles.OUTLINE })
      ])
    ];
  }

  return m('div.article-content', content);
};


module.exports = {
  view: view
};

},{"./../utils":50,"./TagList":31,"mithril":3}],12:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
  return [
    m('span',
      m('button.btn.btn-outline-danger.btn-sm', { onclick: vnode.attrs.action }, [
        m('i.ion-trash-a'), m('span', ' Delete Article')
      ])
    )
  ];
};


module.exports = {
  view: view
};

},{"mithril":3}],13:[function(require,module,exports){
'use strict';


var m = require('mithril');


function onFavoriteButtonClick(e) {
  e.preventDefault();
}


function view(vnode) {
  var count = typeof vnode.attrs.article.favoritesCount === 'number' ? vnode.attrs.article.favoritesCount : '...';

  return [
    m('span',
      m('button.btn.btn-sm.btn-outline-primary', { onclick: onFavoriteButtonClick.bind(this) }, [
        m('i.ion-heart'), m('span', ' Favorite Article (' + count + ')')
      ])
    )
  ];
};


module.exports = {
  view: view
};

},{"mithril":3}],14:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var ArticlePreview = require('./ArticlePreview');
var Pagination = require('./Pagination');


function getTotalPages(limit, total) {
  return Math.ceil(total / (limit || total));
}


function getCurrentPage(limit, offset) {
  return Math.ceil((offset + 1) / limit);
}


function getOffsetFromPageNumber(pageNumber, limit) {
  return Math.ceil((pageNumber - 1) * limit);
}


function getCurrentLimitFromArticles(articles) {
  return articles.limit || 0;
}


function updateSelectedArticles() {
  // domain.actions.setCurrentlyActiveArticles({
  // limit: limit,
  // offset: offset,
  // author: author
  // });
}


function selectPage(pageNumber) {
  var limit = getCurrentLimitFromArticles(domain.store.selectedArticles);
  updateSelectedArticles(limit, getOffsetFromPageNumber(pageNumber, limit), this.author);
}


function updateStateFromAttributes(state, attrs) {
  state.limit = attrs.limit || 10;
  state.offset = attrs.offset || 0;
  state.author = attrs.author || '';

  return state;
}


function oninit(vnode) {
  updateStateFromAttributes(this, vnode.attrs);
  updateSelectedArticles(this.limit, this.offset, this.author);
}


function onbeforeupdate(vnode, vnodePrevious) {
  if (JSON.stringify(vnode.attrs) !== JSON.stringify(vnodePrevious.attrs)) {
    updateStateFromAttributes(this, vnode.attrs);
    updateSelectedArticles(this.limit, this.offset, this.author);
  }
}


function view() {
  var totalPages = 1,
    currentPage = 1;

  if (domain.store.selectedArticles.isLoading) {
    return m('div.article-preview', 'Loading...');
  }

  if (domain.store.selectedArticles.list.length === 0) {
    return m('div.article-preview', 'No articles are here... yet.');
  }

  totalPages = getTotalPages(domain.store.selectedArticles.limit, domain.store.selectedArticles.total);
  currentPage = getCurrentPage(domain.store.selectedArticles.limit, domain.store.selectedArticles.offset);

  return m('div', [
    domain.store.selectedArticles.list.map(function (article) {
      return m(ArticlePreview, { key: article.slug, article: article });
    }),
    m(Pagination, { totalPages: totalPages, currentPage: currentPage, fn_onItemClick: selectPage.bind(this) })
  ]);
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  view: view
};

},{"./../../domain":5,"./ArticlePreview":17,"./Pagination":28,"mithril":3}],15:[function(require,module,exports){
'use strict';


var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
  var article = vnode.attrs.article ? vnode.attrs.article.data : null;
  var content = m('div', '...');

  if (article) {
    content = [
      m(Link, { to: '/@' + article.author.username },
        m('img', { src: article.author.image })
      ),
      m('div.info',
        m(Link, { className: 'author', to: '/@' + article.author.username }, article.author.username),
        m('span.date', utils.formatDate(article.createdAt))
      )
    ];
  }

  return m('div.article-meta', { style: vnode.attrs.style }, [
    content
  ]);
};


module.exports = {
  view: view
};

},{"./../utils":50,"./Link":23,"mithril":3}],16:[function(require,module,exports){
'use strict';


var m = require('mithril');


var ArticleMeta = require('./ArticleMeta');
var ArticleActions = require('./ArticleActions');


function view(vnode) {
  return [
    m(ArticleMeta, { article: vnode.attrs.article, style: 'display:inline-block; ' }),
    m(ArticleActions, { article: vnode.attrs.article })
  ];
};


module.exports = {
  view: view
};

},{"./ArticleActions":9,"./ArticleMeta":15,"mithril":3}],17:[function(require,module,exports){
'use strict';


var m = require('mithril');


var Link = require('./Link');


var FAVORITED_CLASS = 'btn btn-sm btn-primary';
var NOT_FAVORITED_CLASS = 'btn btn-sm btn-outline-primary';


function onFavoriteButtonClick(e) {
  e.preventDefault();
  // TODO add implementation
}


function view(vnode) {
  var article = vnode.attrs.article,
    favoriteButtonClass = article.favorited ?
      FAVORITED_CLASS :
      NOT_FAVORITED_CLASS;

  return m('.article-preview',
    m('.container', [
      m('.article-meta', [
        m(Link, { to: '/@' + article.author.username },
          m('img', { src: article.author.image })
        ),

        m('.info', [
          m(Link, { to: '/@' + article.author.username, className: 'author' }, article.author.username),
          m('.date', new Date(article.createdAt).toDateString())
        ]),

        m('.pull-xs-right',
          m('button', { className: favoriteButtonClass, onclick: onFavoriteButtonClick }, [
            m('i.ion-heart'),
            m('span', ' ' + article.favoritesCount)
          ])
        )

      ]),

      m(Link, { to: '/article/' + article.slug, className: 'preview-link' }, [
        m('h1', article.title),
        m('p', article.description),
        m('span', 'Read more...'),
        m('ul.tag-list', article.tagList.map(function (tag) {
          return m('li.tag-default tag-pill tag-outline', { key: tag }, tag);
        }))
      ])

    ])
  );
};


module.exports = {
  view: view
};

},{"./Link":23,"mithril":3}],18:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
  return [
    m('span',
      m('button.btn.btn-outline-secondary.btn-sm', { onclick: vnode.attrs.action }, [
        m('i.ion-edit'), m('span', ' Edit Article')
      ])
    )
  ];
};


module.exports = {
  view: view
};

},{"mithril":3}],19:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
  var content = [
    m('h1.logo-font', 'conduit'),
    m('p', 'A place to share your knowledge.')
  ];

  if (vnode.children.length > 0) {
    content = vnode.children;
  }

  return m('.banner',
    m('.container', content)
  );
};


module.exports = {
  view: view
};

},{"mithril":3}],20:[function(require,module,exports){
'use strict';


var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
  var comment = vnode.attrs.comment;

  return m('div.card', [
    m('div.card-block',
      m('div.card-text', m.trust(utils.formatArticleCommentBodyText(comment.body)))
    ),
    m('div.card-footer', [
      m(Link, { className: 'comment-author', to: utils.getLinkToUserProfile(comment.author.username) },
        m('img.comment-author-img', { src: comment.author.image })
      ),
      m('span', m.trust('&nbsp; ')),
      m(Link, { className: 'comment-author', to: utils.getLinkToUserProfile(comment.author.username) },
        comment.author.username
      ),
      m('span.date-posted', utils.formatDate(comment.createdAt, utils.dateFormats.DEFAULT_WITH_TIME))
    ])
  ]);
};


module.exports = {
  view: view
};

},{"./../utils":50,"./Link":23,"mithril":3}],21:[function(require,module,exports){
'use strict';


var m = require('mithril');


var Link = require('./Link');
var NewCommentForm = require('./NewCommentForm');
var Comment = require('./Comment');


function view(vnode) {
  var comments = vnode.attrs.comments.data || [];
  var header = m('p', [
    m(Link, { to: '/login' }, 'Sign in'),
    m('span', ' or '),
    m(Link, { to: '/register' }, 'Sign up'),
    m('span', ' to add comments on this article.')
  ]);
  var body = null;

  if (vnode.attrs.currentUser) {
    header = m(NewCommentForm);
  }

  if (vnode.attrs.comments.isLoading) {
    body = m('div', 'Loading...');
  }

  if (comments) {
    body = comments.map(function (comment) {
      return m(Comment, { comment: comment, key: comment.id });
    });
  }

  return m('div.comments', [
    header,
    body
  ]);
};


module.exports = {
  view: view
};

},{"./Comment":20,"./Link":23,"./NewCommentForm":27,"mithril":3}],22:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function setCurrentlyActiveArticles(vnode, type) {
  var payload = {
    type: type
  };

  switch (type.name) {
    case domain.store.articleListTypes.USER_FAVORITED.name:
      payload.author = '';
      payload.favorited = vnode.state.username;
      break;

    case domain.store.articleListTypes.USER_OWNED.name:
      payload.author = vnode.state.username;
      payload.favorited = '';
      break;
  }

  domain.actions.setCurrentlyActiveArticles(payload);
}


function onLinkClick(vnode, type, e) {
  e.preventDefault();

  setCurrentlyActiveArticles(vnode, type);
}


function buildLink(vnode, linkType, currentType) {
  var linkClassName = linkType.name === currentType.name ? '.active' : '';

  return m('li.nav-item',
    m('a.nav-link' + linkClassName, {
      href: '', onclick: onLinkClick.bind(null, vnode, linkType)
    }, linkType.label)
  );
}


function oninit(vnode) {
  console.log('vnode.attrs.currentType', vnode.attrs.currentType);
  setCurrentlyActiveArticles(vnode, vnode.attrs.linkTypes[0]);
}


function view(vnode) {
  var currentType = vnode.attrs.currentType ? vnode.attrs.currentType : '';
  var linkTypes = vnode.attrs.linkTypes ? vnode.attrs.linkTypes : [];
  vnode.state.username = vnode.attrs.username ? vnode.attrs.username : '';

  return m('div.feed-toggle',
    m('ul.nav.nav-pills.outline-active', linkTypes.map(function (linkType) {
      return buildLink(vnode, linkType, currentType);
    }))
  );
};


module.exports = {
  oninit: oninit,
  view: view
};

},{"./../../domain":5,"mithril":3}],23:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
  var onclick = vnode.attrs.onclick ? vnode.attrs.onclick : null;

  return m('a', { className: vnode.attrs.className, href: vnode.attrs.to, oncreate: m.route.link, onupdate: m.route.link, onclick: onclick }, vnode.children);
};


module.exports = {
  view: view
};

},{"mithril":3}],24:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
  var errors = vnode.attrs.errors;

  if (errors) {
    return m('ul.error-messages',
      Object.keys(errors).map(function (errorKey) {
        return m('li', { key: errorKey }, errorKey + ' ' + errors[errorKey]);
      })
    );
  }


  return null;
};


module.exports = {
  view: view
};

},{"mithril":3}],25:[function(require,module,exports){
'use strict';


var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
  var currentUser = vnode.attrs.currentUser ? vnode.attrs.currentUser : {
    username: ''
  };

  var allLinks = {
    home: { route: '/', label: 'Home' },
    login: { route: '/login', label: 'Sign in' },
    register: { route: '/register', label: 'Sign up' },
    editor: { route: '/editor', label: '<i class="ion-compose"></i> New Article' },
    settings: { route: '/settings', label: '<i class="ion-gear-a"></i> Settings' },
    user: { route: '/@' + currentUser.username, label: '<img class="user-pic" src="' + utils.getUserImageOrDefault(currentUser) + '" /> ' + currentUser.username }
  };

  var linksForGuest = [
    allLinks.home,
    allLinks.login,
    allLinks.register
  ];

  var linksForMember = [
    allLinks.home,
    allLinks.editor,
    allLinks.settings,
    allLinks.user
  ];


  var linksToDisplay = linksForGuest;
  if (currentUser.username) {
    linksToDisplay = linksForMember;
  }

  return m('ul', { className: vnode.attrs.className },
    linksToDisplay.map(function (link) {
      var className = 'nav-link';

      if (m.route.get() === link.route) {
        className += ' active';
      }

      return m('li.nav-item', m(Link, { className: className, to: link.route }, m.trust(link.label)));
    })
  );

};


module.exports = {
  view: view
};

},{"./../utils":50,"./Link":23,"mithril":3}],26:[function(require,module,exports){
'use strict';


var m = require('mithril');


var state = {
  fn_submit: null,
  formData: {}
};


function setInputValue(name, value) {
  state.formData[name] = value;
}


function onSubmitButtonClick(e) {
  e.preventDefault();

  state.fn_submit(state.formData);
}


function oninit(vnode) {
  setupFormData(vnode.attrs.article);

  state.fn_submit = vnode.attrs.fn_submit;
}


function setupFormData(data) {
  var articleData = data ? data : {
    title: '',
    description: '',
    body: '',
    tagList: ''
  };

  state.formData = {
    title: articleData.title,
    description: articleData.description,
    body: articleData.body,
    tagList: articleData.tagList
  };
}


function onbeforeupdate(vnode, vnodeOld) {
  if (vnodeOld.attrs.article !== vnode.attrs.article) {
    setupFormData(vnode.attrs.article);
  }

  return true;
}


function view(vnode) {

  return m('form',
    m('fieldset',
      [
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'title')), value: state.formData.title, type: 'text', autocomplete: 'off', placeholder: 'Article Title', disabled: vnode.attrs.isSubmitBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'description')), value: state.formData.description, type: 'text', autocomplete: 'off', placeholder: 'What\'s this article about?', disabled: vnode.attrs.isSubmitBusy })
        ),
        m('fieldset.form-group',
          m('textarea.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'body')), value: state.formData.body, autocomplete: 'off', rows: '8', placeholder: 'Write your article (in markdown)', disabled: vnode.attrs.isSubmitBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'tagList')), value: state.formData.tagList, type: 'text', autocomplete: 'off', placeholder: 'Enter tags', disabled: vnode.attrs.isSubmitBusy })
        ),
        m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onSubmitButtonClick, disabled: vnode.attrs.isSubmitBusy }, 'Publish Article')
      ]
    )
  );
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  view: view
};

},{"mithril":3}],27:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');


var state = {
  formData: {
    articleSlug: '',
    body: ''
  }
};


function setInputValue(name, value) {
  state.formData[name] = value;
}


function isFormSubmissionBusy() {
  return domain.store.isArticleCommentCreationBusy;
}

function isFormSubmitDisabled() {
  return state.formData.body === '' || domain.store.selectedArticle.data === null || isFormSubmissionBusy() === true;
}


function onFormSubmit(e) {
  e.preventDefault();

  setInputValue('articleSlug', domain.store.selectedArticle.data.slug);
  domain.actions.createArticleComment(state.formData);
  setInputValue('body', '');
}


function view() {
  return m('div', [
    m('form.card comment-form', { disabled: isFormSubmissionBusy(), onsubmit: onFormSubmit },
      m('div.card-block',
        m('textarea.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'body')), value: state.formData.body, autocomplete: 'off', disabled: isFormSubmissionBusy(), rows: '3', placeholder: 'Write a comment...' })
      ),
      m('div.card-footer', [
        m('img.comment-author-img', { src: utils.getUserImageOrDefault(domain.store.user) }),
        m('button.btn.btn-sm.btn-primary', { type: 'submit', disabled: isFormSubmitDisabled() }, 'Post Comment')
      ])
    )
  ]);
};


module.exports = {
  view: view
};

},{"./../../domain":5,"./../utils":50,"mithril":3}],28:[function(require,module,exports){
'use strict';


var m = require('mithril');


var Link = require('./Link');


function view(vnode) {
  var totalPages = vnode.attrs.totalPages || 1;
  var currentPage = vnode.attrs.currentPage || 1;
  var pageList = Array.apply(null, Array(totalPages));

  // console.log(vnode.attrs);

  return m('nav',
    m('ul.pagination',
      pageList.map(function (tag, i) {
        var activeClassName = '';

        if (currentPage === (i + 1)) {
          activeClassName = '.active';
        }

        return m('li.page-item' + activeClassName, { key: i },
          m(Link, {
            className: 'page-link',
            to: '',
            onclick: function (e) {
              e.preventDefault();
              vnode.attrs.fn_onItemClick(i + 1);
            }
          }, String(i + 1))
        );
      })
    )
  );
};


module.exports = {
  view: view
};

},{"./Link":23,"mithril":3}],29:[function(require,module,exports){
'use strict';


var m = require('mithril');


var TagList = require('./TagList');


function view(vnode) {
  var tagsContent = m('div', 'Loading Tags...');

  if (vnode.attrs.isLoading === false) {
    tagsContent = m(TagList, { list: vnode.attrs.list });
  }

  return m('div', [
    m('p', 'Popular Tags'),
    tagsContent
  ]);
};


module.exports = {
  view: view
};

},{"./TagList":31,"mithril":3}],30:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
  return m('section', vnode.children);
};


module.exports = {
  view: view
};

},{"mithril":3}],31:[function(require,module,exports){
'use strict';


var m = require('mithril');


var Link = require('./Link');
var styles = {
  OUTLINE: 'OUTLINE'
};


function view(vnode) {
  var list = vnode.attrs.list ? vnode.attrs.list : [];
  var linkClassName = 'tag-default tag-pill';

  if (vnode.attrs.style === styles.OUTLINE) {
    linkClassName += ' tag-outline';
  }

  return m('ul.tag-list',
    list.map(function (tag) {
      return m('li',
        m(Link, {
          className: linkClassName, key: tag, to: '', onclick: function (e) {
            e.preventDefault();
          }
        }, tag)
      );
    })
  );
};


module.exports = {
  styles: styles,
  view: view
};

},{"./Link":23,"mithril":3}],32:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function view(vnode) {
  var action = vnode.attrs.action || domain.actions.followUser.bind(null, vnode.attrs.username);
  var label = vnode.attrs.username ? ' Follow ' + vnode.attrs.username : '';

  return [
    m('span',
      m('button.btn.btn-sm.btn-secondary', { onclick: function () { action(); } }, [
        m('i.ion-plus-round'), m('span', label)
      ])
    )
  ];
};


module.exports = {
  view: view
};

},{"./../../domain":5,"mithril":3}],33:[function(require,module,exports){
'use strict';


var m = require('mithril');


var UserFollowButton = require('./UserFollowButton');
var UserUnfollowButton = require('./UserUnfollowButton');


function getActionButton(isFollowing, username, loggedInUsername) {

  if (!loggedInUsername) {
    return m(UserFollowButton, { username: username, action: m.route.set.bind(null, '/register') });
  }

  if (username === loggedInUsername) {
    return null;
  }

  if (isFollowing === true) {
    return m(UserUnfollowButton, { username: username });
  }

  return m(UserFollowButton, { username: username });
}


function view(vnode) {
  return getActionButton(vnode.attrs.isFollowing, vnode.attrs.username, vnode.attrs.loggedInUsername);
};


module.exports = {
  view: view
};

},{"./UserFollowButton":32,"./UserUnfollowButton":38,"mithril":3}],34:[function(require,module,exports){
'use strict';


var m = require('mithril');


var UserFollowUnfollowButton = require('./UserFollowUnfollowButton');


function view(vnode) {
  var selectedUser = vnode.attrs.selectedUser ? vnode.attrs.selectedUser : {
    bio: '',
    image: '',
    username: ''
  };

  var loggedInUser = vnode.attrs.loggedInUser ? vnode.attrs.loggedInUser : {
    username: ''
  };

  return m('.user-info',
    m('.container',
      [
        m('.row',
          [
            m('.col-xs-12 col-md-10 offset-md-1', [
              m('img.user-img', { src: selectedUser.image }),
              m('h4', selectedUser.username || '...'),
              m('p', selectedUser.bio),
              m(UserFollowUnfollowButton, { isFollowing: selectedUser.following, username: selectedUser.username, loggedInUsername: loggedInUser.username })
            ]),
          ]
        )
      ]
    )
  );
};


module.exports = {
  view: view
};

},{"./UserFollowUnfollowButton":33,"mithril":3}],35:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');


var state = {
  email: '',
  password: '',
  setEmail: function (v) { state.email = v; },
  setPassword: function (v) { state.password = v; }
};


function onLoginButtonClick(e) {
  e.preventDefault();

  domain.actions.attemptUserLogin(state.email, state.password);
}


function view(vnode) {
  return m('form',
    m('fieldset',
      [
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', state.setEmail), value: state.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserLoginBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', state.setPassword), value: state.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserLoginBusy })
        ),
        m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onLoginButtonClick, disabled: vnode.attrs.isUserLoginBusy }, 'Sign in')
      ]
    )
  );
};


module.exports = {
  view: view
};

},{"./../../domain":5,"mithril":3}],36:[function(require,module,exports){
'use strict';


var m = require('mithril');


var state = {
  fn_registerUser: null,
  formData: {}
};


function setInputValue(name, value) {
  state.formData[name] = value;
}


function onRegisterButtonClick(e) {
  e.preventDefault();

  state.fn_registerUser(state.formData);
}


function oninit(vnode) {
  state.formData = {
    email: '',
    password: '',
    username: ''
  };

  state.fn_registerUser = vnode.attrs.fn_registerUser;
}



function view(vnode) {
  return m('form',
    m('fieldset',
      [
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'username')), value: state.formData.username, type: 'text', autocomplete: 'off', placeholder: 'Username', disabled: vnode.attrs.isUserRegistrationBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'email')), value: state.formData.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserRegistrationBusy })
        ),
        m('fieldset.form-group',
          m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'password')), value: state.formData.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserRegistrationBusy })
        ),
        m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onRegisterButtonClick, disabled: vnode.attrs.isUserRegistrationBusy }, 'Sign up')
      ]
    )
  );
};


module.exports = {
  oninit: oninit,
  view: view
};

},{"mithril":3}],37:[function(require,module,exports){
'use strict';


var m = require('mithril');


var state = {
  fn_updateUserSettings: null,
  fn_logUserOut: null,
  formData: {}
};


function setInputValue(name, value) {
  state.formData[name] = value;
}


function onSubmitButtonClick(e) {
  e.preventDefault();

  state.fn_updateUserSettings(state.formData);
}


function onLogoutButtonClick(e) {
  e.preventDefault();

  state.fn_logUserOut();
}


function oninit(vnode) {
  setupFormData(vnode.attrs.currentUser);

  state.fn_updateUserSettings = vnode.attrs.fn_updateUserSettings;
  state.fn_logUserOut = vnode.attrs.fn_logUserOut;
}


function setupFormData(data) {
  var userData = data ? data : {
    bio: '',
    email: '',
    image: '',
    username: ''
  };

  state.formData = {
    bio: userData.bio,
    email: userData.email,
    image: userData.image,
    username: userData.username
  };
}


function onbeforeupdate(vnode, vnodeOld) {
  if (vnodeOld.attrs.currentUser !== vnode.attrs.currentUser) {
    setupFormData(vnode.attrs.currentUser);
  }

  return true;
}


function view(vnode) {

  return m('div', [
    m('form',
      m('fieldset',
        [
          m('fieldset.form-group',
            m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'image')), value: state.formData.image, type: 'text', autocomplete: 'off', placeholder: 'URL of profile picture', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('fieldset.form-group',
            m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'username')), value: state.formData.username, type: 'email', autocomplete: 'off', placeholder: 'Username', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('fieldset.form-group',
            m('textarea.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'bio')), value: state.formData.bio, autocomplete: 'off', rows: '8', placeholder: 'Short bio about you', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('fieldset.form-group',
            m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'email')), value: state.formData.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('fieldset.form-group',
            m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'password')), value: state.formData.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserSettingsUpdateBusy })
          ),
          m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onSubmitButtonClick, disabled: vnode.attrs.isUserSettingsUpdateBusy }, 'Update Settings')
        ]
      )
    ),
    m('hr'),
    m('button.btn.btn-outline-danger', { onclick: onLogoutButtonClick, disabled: vnode.attrs.isUserSettingsUpdateBusy }, 'Or click here to logout')
  ]);
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  view: view
};

},{"mithril":3}],38:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function view(vnode) {
  var action = domain.actions.unfollowUser.bind(null, vnode.attrs.username);
  var label = vnode.attrs.username ? ' Unfollow ' + vnode.attrs.username : '';

  return [
    m('span',
      m('button.btn.btn-sm.btn-secondary', { onclick: function () { action(); } }, [
        m('i.ion-minus-round'), m('span', label)
      ])
    )
  ];
};


module.exports = {
  view: view
};

},{"./../../domain":5,"mithril":3}],39:[function(require,module,exports){
'use strict';


var m = require('mithril');


var name = 'LayoutDefault';


var AppHeader = require('./../components/AppHeader');
var ScreenContent = require('./../components/ScreenContent');
var AppFooter = require('./../components/AppFooter');


function view(vnode) {
  return m('div', { className: name },
    [
      m(AppHeader),
      m(ScreenContent, {}, vnode.children),
      m(AppFooter)
    ]
  );
}


module.exports = {
  view: view
};

},{"./../components/AppFooter":7,"./../components/AppHeader":8,"./../components/ScreenContent":30,"mithril":3}],40:[function(require,module,exports){
'use strict';


var m = require('mithril');


var name = 'LayoutHome';


var AppHeader = require('./../components/AppHeader');
var ScreenContent = require('./../components/ScreenContent');


function view(vnode) {
  return m('div', {
    className: name
  },
    [
      m(AppHeader),
      m(ScreenContent, {}, vnode.children)
    ]
  );
}


module.exports = {
  view: view
};

},{"./../components/AppHeader":8,"./../components/ScreenContent":30,"mithril":3}],41:[function(require,module,exports){
'use strict';


var m = require('mithril');


var LayoutDefault = require('./layouts/LayoutDefault');
var LayoutHome = require('./layouts/LayoutHome');


var ScreenHome = require('./screens/ScreenHome');
var ScreenArticle = require('./screens/ScreenArticle');
var ScreenUserLogin = require('./screens/ScreenUserLogin');
var ScreenUserRegister = require('./screens/ScreenUserRegister');
var ScreenUserProfile = require('./screens/ScreenUserProfile');
var ScreenUserSettings = require('./screens/ScreenUserSettings');
var ScreenUserFavorites = require('./screens/ScreenUserFavorites');
var ScreenEditor = require('./screens/ScreenEditor');


var routes = {
  '/': buildRoute(ScreenHome, LayoutHome),
  '/article/:slug': buildRoute(ScreenArticle),
  '/register': buildRoute(ScreenUserRegister),
  '/login': buildRoute(ScreenUserLogin),
  '/@:username': buildRoute(ScreenUserProfile),
  '/@:username/favorites': buildRoute(ScreenUserFavorites),
  '/settings': buildRoute(ScreenUserSettings),
  '/editor': buildRoute(ScreenEditor),
  '/editor/:slug': buildRoute(ScreenEditor)
};


function buildRoute(screen, layout) {
  layout = layout || LayoutDefault;

  return {
    render: function () {
      return m(layout, m(screen));
    }
  };
}


function init() {
  m.route.prefix('?');
  m.route(document.getElementById('app'), '/', routes);
}


module.exports = {
  init: init
};

},{"./layouts/LayoutDefault":39,"./layouts/LayoutHome":40,"./screens/ScreenArticle":42,"./screens/ScreenEditor":43,"./screens/ScreenHome":44,"./screens/ScreenUserFavorites":45,"./screens/ScreenUserLogin":46,"./screens/ScreenUserProfile":47,"./screens/ScreenUserRegister":48,"./screens/ScreenUserSettings":49,"mithril":3}],42:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./../components/Banner');
var ArticleBanner = require('./../components/ArticleBanner');
var ArticleContent = require('./../components/ArticleContent');
var ArticleMetaAndActions = require('./../components/ArticleMetaAndActions');
var Comments = require('./../components/Comments');


var state = {
  slug: ''
};


function getArticle() {
  state.slug = m.route.param('slug');
  domain.actions.setSelectedArticle(state.slug);
  domain.actions.setSelectedArticleComments(state.slug);
  document.body.scrollTop = 0;
}


function oninit() {
  getArticle();
}


function onbeforeupdate() {
  if (state.slug !== m.route.param('slug')) {
    getArticle();
  }

  return true;
}


function onupdate() {
  if (domain.store.selectedArticle.data) {
    utils.updateDocumentTitle(domain.store.selectedArticle.data.title);
  }
}


function view() {
  return m('div.article-page',
    [
      m(Banner,
        m(ArticleBanner, { article: domain.store.selectedArticle })
      ),
      m('div.container', [
        m('div.row', [
          m(ArticleContent, { article: domain.store.selectedArticle }),
        ]),
        m('hr'),
        m('div.article-actions', [
          m(ArticleMetaAndActions, { article: domain.store.selectedArticle })
        ]),
        m('div.row',
          m('div.col-xs-12.col-md-8.offset-md-2',
            m(Comments, { comments: domain.store.selectedArticleComments, currentUser: domain.store.user })
          )
        )
      ])
    ]
  );
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  onupdate: onupdate,
  view: view
};

},{"./../../domain":5,"./../components/ArticleBanner":10,"./../components/ArticleContent":11,"./../components/ArticleMetaAndActions":16,"./../components/Banner":19,"./../components/Comments":21,"./../utils":50,"mithril":3}],43:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var NewArticleForm = require('./../components/NewArticleForm');
var ListErrors = require('./../components/ListErrors');


function oninit() {
  utils.updateDocumentTitle('Editor');
}


function view() {
  return m('.container.page', [
    m('.row', [
      m('.col-md-10.offset-md-1.col-xs-12', [
        m(ListErrors, { errors: domain.store.createArticleErrors }),
        m(NewArticleForm, { isSubmitBusy: domain.store.isCreateArticleBusy, fn_submit: domain.actions.createArticle })
      ])
    ])
  ]);
};


module.exports = {
  oninit: oninit,
  view: view
};

},{"./../../domain":5,"./../components/ListErrors":24,"./../components/NewArticleForm":26,"./../utils":50,"mithril":3}],44:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./../components/Banner');
var ArticleList = require('./../components/ArticleList');
var FeedToggle = require('./../components/FeedToggle');
var PopularTagList = require('./../components/PopularTagList');


function onTagItemClick(tag) {
  domain.actions.getArticlesByTag(tag);
}


function oninit() {
  utils.updateDocumentTitle('Home');
  domain.actions.getTags();
}


function view() {
  var banner = m(Banner);

  if (domain.store.user) {
    banner = null;
  }

  return m('div.home-page',
    [
      banner,
      m('.container.page', [
        m('.row', [
          m('.col-md-9', [
            m(FeedToggle, {
              currentType: domain.store.selectedArticles.type, username: domain.store.user ? domain.store.user.username : '', linkTypes: [
                domain.store.articleListTypes.USER_FAVORITED,
                domain.store.articleListTypes.GLOBAL,
                domain.store.articleListTypes.USER_OWNED
              ]
            }),
            m(ArticleList, { limit: 10 })
          ]),
          m('.col-md-3', [
            m('.sidebar', m(PopularTagList, { fn_onTagItemClick: onTagItemClick, isLoading: domain.store.tags.isLoading, list: domain.store.tags.list }))
          ])
        ])
      ])
    ]
  );
};


module.exports = {
  oninit: oninit,
  view: view
};

},{"./../../domain":5,"./../components/ArticleList":14,"./../components/Banner":19,"./../components/FeedToggle":22,"./../components/PopularTagList":29,"./../utils":50,"mithril":3}],45:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./../components/Banner');


var state = {
  username: ''
};


function getUserProfile() {
  state.username = m.route.param('username');
  domain.actions.getUserProfile(state.username);
  document.body.scrollTop = 0;
}


function oninit() {
  getUserProfile();
}


function onbeforeupdate() {
  if (state.username !== m.route.param('username')) {
    getUserProfile();
  }

  return true;
}


function onupdate() {
  utils.updateDocumentTitle('Articles favourited by ' + state.username);
}


function view() {
  return m('div',
    [
      m(Banner),
      m('h1', 'ScreenUserFavorites')
    ]
  );
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  onupdate: onupdate,
  view: view
};

},{"./../../domain":5,"./../components/Banner":19,"./../utils":50,"mithril":3}],46:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Link = require('./../components/Link');
var UserLoginForm = require('./../components/UserLoginForm');
var ListErrors = require('./../components/ListErrors');


function redirectIfUserLoggedIn() {
  if (domain.store.user) {
    domain.actions.redirectAfterUserLoginSuccess();
  }
}


function oninit() {
  utils.updateDocumentTitle('Sign in');

  redirectIfUserLoggedIn();
}


function onupdate() {
  redirectIfUserLoggedIn();
}


function view() {
  return m('div',
    [
      m('.container.page', [
        m('.row', [
          m('.col-md-6.offset-md-3.col-xs-12', [
            m('h1.text-xs-center', 'Sign in'),
            m('p.text-xs-center',
              m(Link, { to: '/register' }, 'Need an account?')
            ),
            m(ListErrors, { errors: domain.store.userLoginErrors }),
            m(UserLoginForm, { isUserLoginBusy: domain.store.isUserLoginBusy })
          ])
        ])
      ])
    ]
  );
};


module.exports = {
  oninit: oninit,
  onupdate: onupdate,
  view: view
};

},{"./../../domain":5,"./../components/Link":23,"./../components/ListErrors":24,"./../components/UserLoginForm":35,"./../utils":50,"mithril":3}],47:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var UserInfoBanner = require('./../components/UserInfoBanner');
var FeedToggle = require('./../components/FeedToggle');
var ArticleList = require('./../components/ArticleList');


var state = {
  username: ''
};


function getUserProfile() {
  state.username = m.route.param('username');
  domain.actions.getUserProfile(state.username);
  document.body.scrollTop = 0;
}


function oninit() {
  getUserProfile();
}


function onbeforeupdate() {
  if (state.username !== m.route.param('username')) {
    getUserProfile();
  }

  return true;
}


function onupdate() {
  utils.updateDocumentTitle('@' + state.username);
}


function view() {
  var username = m.route.param('username') || '';

  return m('.profile-page',
    [
      m(UserInfoBanner, { loggedInUser: domain.store.user, selectedUser: domain.store.selectedUserProfile.data, isLoading: domain.store.selectedUserProfile.isLoading }),
      m('.container', [
        m('.row', [
          m('.col-md-12', [
            m(FeedToggle, {
              currentType: domain.store.selectedArticles.type, username: username, linkTypes: [
                domain.store.articleListTypes.USER_OWNED,
                domain.store.articleListTypes.USER_FAVORITED
              ]
            }),
            m(ArticleList, { limit: 5 })
          ])
        ])
      ])
    ]
  );
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  onupdate: onupdate,
  view: view
};

},{"./../../domain":5,"./../components/ArticleList":14,"./../components/FeedToggle":22,"./../components/UserInfoBanner":34,"./../utils":50,"mithril":3}],48:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Link = require('./../components/Link');
var ListErrors = require('./../components/ListErrors');
var UserRegistrationForm = require('./../components/UserRegistrationForm');


function oninit() {
  utils.updateDocumentTitle('Sign up');
}


function onupdate() {
  if (domain.store.user) {
    domain.actions.redirectAfterUserRegistrationSuccess();
  }
}


function view() {
  return m('div',
    [
      m('.container.page', [
        m('.row', [
          m('.col-md-6.offset-md-3.col-xs-12', [
            m('h1.text-xs-center', 'Sign up'),
            m('p.text-xs-center',
              m(Link, { to: '/login' }, 'Have an account?')
            ),
            m(ListErrors, { errors: domain.store.userRegistrationErrors }),
            m(UserRegistrationForm, { isUserRegistrationBusy: domain.store.isUserRegistrationBusy, fn_registerUser: domain.actions.registerNewUser })
          ])
        ])
      ])
    ]
  );
};


module.exports = {
  oninit: oninit,
  onupdate: onupdate,
  view: view
};

},{"./../../domain":5,"./../components/Link":23,"./../components/ListErrors":24,"./../components/UserRegistrationForm":36,"./../utils":50,"mithril":3}],49:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var ListErrors = require('./../components/ListErrors');
var UserSettingsForm = require('./../components/UserSettingsForm');


function oninit() {
  utils.updateDocumentTitle('Settings');
}


function view() {
  return m('.container.page', [
    m('.row', [
      m('.col-md-6.offset-md-3.col-xs-12', [
        m('h1.text-xs-center', 'Your Settings'),
        m(ListErrors, { errors: domain.store.userUpdateSettingsErrors }),
        m(UserSettingsForm, { currentUser: domain.store.user, isUserSettingsUpdateBusy: domain.store.isUserSettingsUpdateBusy, fn_updateUserSettings: domain.actions.updateUserSettings, fn_logUserOut: domain.actions.logUserOut })
      ])
    ])
  ]);
};


module.exports = {
  oninit: oninit,
  view: view
};

},{"./../../domain":5,"./../components/ListErrors":24,"./../components/UserSettingsForm":37,"./../utils":50,"mithril":3}],50:[function(require,module,exports){
'use strict';


var domain = require('./../domain');


var xssFilters = require('xss-filters');
var dateFormatTypes = {
  DEFAULT: 'mmmm d, yyyy',
  DEFAULT_WITH_TIME: 'mmmm d, yyyy @ HH:MM:ss'
};


function updateDocumentTitle(text) {
  document.title = text + ' — ' + domain.store.appTitle;
}


function formatDate(dateString, format) {
  var dateFormat = require('dateformat');

  if (!format) {
    format = dateFormatTypes.DEFAULT;
  }

  try {
    var date = new Date(dateString);
    return dateFormat(date, format);
  } catch (e) {
    return dateString;
  }
}


function convertMarkdownToHTML(content) {
  var marked = require('marked');

  return marked(content);
}


function formatArticleCommentBodyText(content) {
  return convertMarkdownToHTML(xssFilters.inSingleQuotedAttr(content));
}


function getLinkToUserProfile(username) {
  return '/@' + username;
}


function getUserImageOrDefault(user) {
  if (user && (user.image)) {
    return user.image;
  }

  return 'https://static.productionready.io/images/smiley-cyrus.jpg';
}


module.exports = {
  updateDocumentTitle: updateDocumentTitle,
  dateFormats: dateFormatTypes,
  formatDate: formatDate,
  formatArticleCommentBodyText: formatArticleCommentBodyText,
  convertMarkdownToHTML: convertMarkdownToHTML,
  getLinkToUserProfile: getLinkToUserProfile,
  getUserImageOrDefault: getUserImageOrDefault
};

},{"./../domain":5,"dateformat":1,"marked":2,"xss-filters":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGF0ZWZvcm1hdC9saWIvZGF0ZWZvcm1hdC5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsL21pdGhyaWwuanMiLCJub2RlX21vZHVsZXMveHNzLWZpbHRlcnMvc3JjL3hzcy1maWx0ZXJzLmpzIiwic3JjL2RvbWFpbi9pbmRleC5qcyIsInNyYy9pbmRleC5qcyIsInNyYy91aS9jb21wb25lbnRzL0FwcEZvb3Rlci5qcyIsInNyYy91aS9jb21wb25lbnRzL0FwcEhlYWRlci5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVBY3Rpb25zLmpzIiwic3JjL3VpL2NvbXBvbmVudHMvQXJ0aWNsZUJhbm5lci5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVDb250ZW50LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvQXJ0aWNsZURlbGV0ZUJ1dHRvbi5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVGYXZvcml0ZUJ1dHRvbi5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVMaXN0LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvQXJ0aWNsZU1ldGEuanMiLCJzcmMvdWkvY29tcG9uZW50cy9BcnRpY2xlTWV0YUFuZEFjdGlvbnMuanMiLCJzcmMvdWkvY29tcG9uZW50cy9BcnRpY2xlUHJldmlldy5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVVcGRhdGVCdXR0b24uanMiLCJzcmMvdWkvY29tcG9uZW50cy9CYW5uZXIuanMiLCJzcmMvdWkvY29tcG9uZW50cy9Db21tZW50LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvQ29tbWVudHMuanMiLCJzcmMvdWkvY29tcG9uZW50cy9GZWVkVG9nZ2xlLmpzIiwic3JjL3VpL2NvbXBvbmVudHMvTGluay5qcyIsInNyYy91aS9jb21wb25lbnRzL0xpc3RFcnJvcnMuanMiLCJzcmMvdWkvY29tcG9uZW50cy9NYWluTmF2LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvTmV3QXJ0aWNsZUZvcm0uanMiLCJzcmMvdWkvY29tcG9uZW50cy9OZXdDb21tZW50Rm9ybS5qcyIsInNyYy91aS9jb21wb25lbnRzL1BhZ2luYXRpb24uanMiLCJzcmMvdWkvY29tcG9uZW50cy9Qb3B1bGFyVGFnTGlzdC5qcyIsInNyYy91aS9jb21wb25lbnRzL1NjcmVlbkNvbnRlbnQuanMiLCJzcmMvdWkvY29tcG9uZW50cy9UYWdMaXN0LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvVXNlckZvbGxvd0J1dHRvbi5qcyIsInNyYy91aS9jb21wb25lbnRzL1VzZXJGb2xsb3dVbmZvbGxvd0J1dHRvbi5qcyIsInNyYy91aS9jb21wb25lbnRzL1VzZXJJbmZvQmFubmVyLmpzIiwic3JjL3VpL2NvbXBvbmVudHMvVXNlckxvZ2luRm9ybS5qcyIsInNyYy91aS9jb21wb25lbnRzL1VzZXJSZWdpc3RyYXRpb25Gb3JtLmpzIiwic3JjL3VpL2NvbXBvbmVudHMvVXNlclNldHRpbmdzRm9ybS5qcyIsInNyYy91aS9jb21wb25lbnRzL1VzZXJVbmZvbGxvd0J1dHRvbi5qcyIsInNyYy91aS9sYXlvdXRzL0xheW91dERlZmF1bHQuanMiLCJzcmMvdWkvbGF5b3V0cy9MYXlvdXRIb21lLmpzIiwic3JjL3VpL3JvdXRlci5qcyIsInNyYy91aS9zY3JlZW5zL1NjcmVlbkFydGljbGUuanMiLCJzcmMvdWkvc2NyZWVucy9TY3JlZW5FZGl0b3IuanMiLCJzcmMvdWkvc2NyZWVucy9TY3JlZW5Ib21lLmpzIiwic3JjL3VpL3NjcmVlbnMvU2NyZWVuVXNlckZhdm9yaXRlcy5qcyIsInNyYy91aS9zY3JlZW5zL1NjcmVlblVzZXJMb2dpbi5qcyIsInNyYy91aS9zY3JlZW5zL1NjcmVlblVzZXJQcm9maWxlLmpzIiwic3JjL3VpL3NjcmVlbnMvU2NyZWVuVXNlclJlZ2lzdGVyLmpzIiwic3JjL3VpL3NjcmVlbnMvU2NyZWVuVXNlclNldHRpbmdzLmpzIiwic3JjL3VpL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3pwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2tDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG4gKiBEYXRlIEZvcm1hdCAxLjIuM1xyXG4gKiAoYykgMjAwNy0yMDA5IFN0ZXZlbiBMZXZpdGhhbiA8c3RldmVubGV2aXRoYW4uY29tPlxyXG4gKiBNSVQgbGljZW5zZVxyXG4gKlxyXG4gKiBJbmNsdWRlcyBlbmhhbmNlbWVudHMgYnkgU2NvdHQgVHJlbmRhIDxzY290dC50cmVuZGEubmV0PlxyXG4gKiBhbmQgS3JpcyBLb3dhbCA8Y2l4YXIuY29tL35rcmlzLmtvd2FsLz5cclxuICpcclxuICogQWNjZXB0cyBhIGRhdGUsIGEgbWFzaywgb3IgYSBkYXRlIGFuZCBhIG1hc2suXHJcbiAqIFJldHVybnMgYSBmb3JtYXR0ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gZGF0ZS5cclxuICogVGhlIGRhdGUgZGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgZGF0ZS90aW1lLlxyXG4gKiBUaGUgbWFzayBkZWZhdWx0cyB0byBkYXRlRm9ybWF0Lm1hc2tzLmRlZmF1bHQuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uKGdsb2JhbCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIGRhdGVGb3JtYXQgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciB0b2tlbiA9IC9kezEsNH18bXsxLDR9fHl5KD86eXkpP3woW0hoTXNUdF0pXFwxP3xbTGxvU1pXTl18J1teJ10qJ3wnW14nXSonL2c7XHJcbiAgICAgIHZhciB0aW1lem9uZSA9IC9cXGIoPzpbUE1DRUFdW1NEUF1UfCg/OlBhY2lmaWN8TW91bnRhaW58Q2VudHJhbHxFYXN0ZXJufEF0bGFudGljKSAoPzpTdGFuZGFyZHxEYXlsaWdodHxQcmV2YWlsaW5nKSBUaW1lfCg/OkdNVHxVVEMpKD86Wy0rXVxcZHs0fSk/KVxcYi9nO1xyXG4gICAgICB2YXIgdGltZXpvbmVDbGlwID0gL1teLStcXGRBLVpdL2c7XHJcbiAgXHJcbiAgICAgIC8vIFJlZ2V4ZXMgYW5kIHN1cHBvcnRpbmcgZnVuY3Rpb25zIGFyZSBjYWNoZWQgdGhyb3VnaCBjbG9zdXJlXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0ZSwgbWFzaywgdXRjLCBnbXQpIHtcclxuICBcclxuICAgICAgICAvLyBZb3UgY2FuJ3QgcHJvdmlkZSB1dGMgaWYgeW91IHNraXAgb3RoZXIgYXJncyAodXNlIHRoZSAnVVRDOicgbWFzayBwcmVmaXgpXHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYga2luZE9mKGRhdGUpID09PSAnc3RyaW5nJyAmJiAhL1xcZC8udGVzdChkYXRlKSkge1xyXG4gICAgICAgICAgbWFzayA9IGRhdGU7XHJcbiAgICAgICAgICBkYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICBcclxuICAgICAgICBkYXRlID0gZGF0ZSB8fCBuZXcgRGF0ZTtcclxuICBcclxuICAgICAgICBpZighKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkge1xyXG4gICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xyXG4gICAgICAgIH1cclxuICBcclxuICAgICAgICBpZiAoaXNOYU4oZGF0ZSkpIHtcclxuICAgICAgICAgIHRocm93IFR5cGVFcnJvcignSW52YWxpZCBkYXRlJyk7XHJcbiAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgIG1hc2sgPSBTdHJpbmcoZGF0ZUZvcm1hdC5tYXNrc1ttYXNrXSB8fCBtYXNrIHx8IGRhdGVGb3JtYXQubWFza3NbJ2RlZmF1bHQnXSk7XHJcbiAgXHJcbiAgICAgICAgLy8gQWxsb3cgc2V0dGluZyB0aGUgdXRjL2dtdCBhcmd1bWVudCB2aWEgdGhlIG1hc2tcclxuICAgICAgICB2YXIgbWFza1NsaWNlID0gbWFzay5zbGljZSgwLCA0KTtcclxuICAgICAgICBpZiAobWFza1NsaWNlID09PSAnVVRDOicgfHwgbWFza1NsaWNlID09PSAnR01UOicpIHtcclxuICAgICAgICAgIG1hc2sgPSBtYXNrLnNsaWNlKDQpO1xyXG4gICAgICAgICAgdXRjID0gdHJ1ZTtcclxuICAgICAgICAgIGlmIChtYXNrU2xpY2UgPT09ICdHTVQ6Jykge1xyXG4gICAgICAgICAgICBnbXQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICBcclxuICAgICAgICB2YXIgXyA9IHV0YyA/ICdnZXRVVEMnIDogJ2dldCc7XHJcbiAgICAgICAgdmFyIGQgPSBkYXRlW18gKyAnRGF0ZSddKCk7XHJcbiAgICAgICAgdmFyIEQgPSBkYXRlW18gKyAnRGF5J10oKTtcclxuICAgICAgICB2YXIgbSA9IGRhdGVbXyArICdNb250aCddKCk7XHJcbiAgICAgICAgdmFyIHkgPSBkYXRlW18gKyAnRnVsbFllYXInXSgpO1xyXG4gICAgICAgIHZhciBIID0gZGF0ZVtfICsgJ0hvdXJzJ10oKTtcclxuICAgICAgICB2YXIgTSA9IGRhdGVbXyArICdNaW51dGVzJ10oKTtcclxuICAgICAgICB2YXIgcyA9IGRhdGVbXyArICdTZWNvbmRzJ10oKTtcclxuICAgICAgICB2YXIgTCA9IGRhdGVbXyArICdNaWxsaXNlY29uZHMnXSgpO1xyXG4gICAgICAgIHZhciBvID0gdXRjID8gMCA6IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICB2YXIgVyA9IGdldFdlZWsoZGF0ZSk7XHJcbiAgICAgICAgdmFyIE4gPSBnZXREYXlPZldlZWsoZGF0ZSk7XHJcbiAgICAgICAgdmFyIGZsYWdzID0ge1xyXG4gICAgICAgICAgZDogICAgZCxcclxuICAgICAgICAgIGRkOiAgIHBhZChkKSxcclxuICAgICAgICAgIGRkZDogIGRhdGVGb3JtYXQuaTE4bi5kYXlOYW1lc1tEXSxcclxuICAgICAgICAgIGRkZGQ6IGRhdGVGb3JtYXQuaTE4bi5kYXlOYW1lc1tEICsgN10sXHJcbiAgICAgICAgICBtOiAgICBtICsgMSxcclxuICAgICAgICAgIG1tOiAgIHBhZChtICsgMSksXHJcbiAgICAgICAgICBtbW06ICBkYXRlRm9ybWF0LmkxOG4ubW9udGhOYW1lc1ttXSxcclxuICAgICAgICAgIG1tbW06IGRhdGVGb3JtYXQuaTE4bi5tb250aE5hbWVzW20gKyAxMl0sXHJcbiAgICAgICAgICB5eTogICBTdHJpbmcoeSkuc2xpY2UoMiksXHJcbiAgICAgICAgICB5eXl5OiB5LFxyXG4gICAgICAgICAgaDogICAgSCAlIDEyIHx8IDEyLFxyXG4gICAgICAgICAgaGg6ICAgcGFkKEggJSAxMiB8fCAxMiksXHJcbiAgICAgICAgICBIOiAgICBILFxyXG4gICAgICAgICAgSEg6ICAgcGFkKEgpLFxyXG4gICAgICAgICAgTTogICAgTSxcclxuICAgICAgICAgIE1NOiAgIHBhZChNKSxcclxuICAgICAgICAgIHM6ICAgIHMsXHJcbiAgICAgICAgICBzczogICBwYWQocyksXHJcbiAgICAgICAgICBsOiAgICBwYWQoTCwgMyksXHJcbiAgICAgICAgICBMOiAgICBwYWQoTWF0aC5yb3VuZChMIC8gMTApKSxcclxuICAgICAgICAgIHQ6ICAgIEggPCAxMiA/ICdhJyAgOiAncCcsXHJcbiAgICAgICAgICB0dDogICBIIDwgMTIgPyAnYW0nIDogJ3BtJyxcclxuICAgICAgICAgIFQ6ICAgIEggPCAxMiA/ICdBJyAgOiAnUCcsXHJcbiAgICAgICAgICBUVDogICBIIDwgMTIgPyAnQU0nIDogJ1BNJyxcclxuICAgICAgICAgIFo6ICAgIGdtdCA/ICdHTVQnIDogdXRjID8gJ1VUQycgOiAoU3RyaW5nKGRhdGUpLm1hdGNoKHRpbWV6b25lKSB8fCBbJyddKS5wb3AoKS5yZXBsYWNlKHRpbWV6b25lQ2xpcCwgJycpLFxyXG4gICAgICAgICAgbzogICAgKG8gPiAwID8gJy0nIDogJysnKSArIHBhZChNYXRoLmZsb29yKE1hdGguYWJzKG8pIC8gNjApICogMTAwICsgTWF0aC5hYnMobykgJSA2MCwgNCksXHJcbiAgICAgICAgICBTOiAgICBbJ3RoJywgJ3N0JywgJ25kJywgJ3JkJ11bZCAlIDEwID4gMyA/IDAgOiAoZCAlIDEwMCAtIGQgJSAxMCAhPSAxMCkgKiBkICUgMTBdLFxyXG4gICAgICAgICAgVzogICAgVyxcclxuICAgICAgICAgIE46ICAgIE5cclxuICAgICAgICB9O1xyXG4gIFxyXG4gICAgICAgIHJldHVybiBtYXNrLnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uIChtYXRjaCkge1xyXG4gICAgICAgICAgaWYgKG1hdGNoIGluIGZsYWdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmbGFnc1ttYXRjaF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbWF0Y2guc2xpY2UoMSwgbWF0Y2gubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbiAgICB9KSgpO1xyXG5cclxuICBkYXRlRm9ybWF0Lm1hc2tzID0ge1xyXG4gICAgJ2RlZmF1bHQnOiAgICAgICAgICAgICAgICdkZGQgbW1tIGRkIHl5eXkgSEg6TU06c3MnLFxyXG4gICAgJ3Nob3J0RGF0ZSc6ICAgICAgICAgICAgICdtL2QveXknLFxyXG4gICAgJ21lZGl1bURhdGUnOiAgICAgICAgICAgICdtbW0gZCwgeXl5eScsXHJcbiAgICAnbG9uZ0RhdGUnOiAgICAgICAgICAgICAgJ21tbW0gZCwgeXl5eScsXHJcbiAgICAnZnVsbERhdGUnOiAgICAgICAgICAgICAgJ2RkZGQsIG1tbW0gZCwgeXl5eScsXHJcbiAgICAnc2hvcnRUaW1lJzogICAgICAgICAgICAgJ2g6TU0gVFQnLFxyXG4gICAgJ21lZGl1bVRpbWUnOiAgICAgICAgICAgICdoOk1NOnNzIFRUJyxcclxuICAgICdsb25nVGltZSc6ICAgICAgICAgICAgICAnaDpNTTpzcyBUVCBaJyxcclxuICAgICdpc29EYXRlJzogICAgICAgICAgICAgICAneXl5eS1tbS1kZCcsXHJcbiAgICAnaXNvVGltZSc6ICAgICAgICAgICAgICAgJ0hIOk1NOnNzJyxcclxuICAgICdpc29EYXRlVGltZSc6ICAgICAgICAgICAneXl5eS1tbS1kZFxcJ1RcXCdISDpNTTpzc28nLFxyXG4gICAgJ2lzb1V0Y0RhdGVUaW1lJzogICAgICAgICdVVEM6eXl5eS1tbS1kZFxcJ1RcXCdISDpNTTpzc1xcJ1pcXCcnLFxyXG4gICAgJ2V4cGlyZXNIZWFkZXJGb3JtYXQnOiAgICdkZGQsIGRkIG1tbSB5eXl5IEhIOk1NOnNzIFonXHJcbiAgfTtcclxuXHJcbiAgLy8gSW50ZXJuYXRpb25hbGl6YXRpb24gc3RyaW5nc1xyXG4gIGRhdGVGb3JtYXQuaTE4biA9IHtcclxuICAgIGRheU5hbWVzOiBbXHJcbiAgICAgICdTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnLFxyXG4gICAgICAnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXHJcbiAgICBdLFxyXG4gICAgbW9udGhOYW1lczogW1xyXG4gICAgICAnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnLFxyXG4gICAgICAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlcidcclxuICAgIF1cclxuICB9O1xyXG5cclxuZnVuY3Rpb24gcGFkKHZhbCwgbGVuKSB7XHJcbiAgdmFsID0gU3RyaW5nKHZhbCk7XHJcbiAgbGVuID0gbGVuIHx8IDI7XHJcbiAgd2hpbGUgKHZhbC5sZW5ndGggPCBsZW4pIHtcclxuICAgIHZhbCA9ICcwJyArIHZhbDtcclxuICB9XHJcbiAgcmV0dXJuIHZhbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgSVNPIDg2MDEgd2VlayBudW1iZXJcclxuICogQmFzZWQgb24gY29tbWVudHMgZnJvbVxyXG4gKiBodHRwOi8vdGVjaGJsb2cucHJvY3VyaW9zLm5sL2svbjYxOC9uZXdzL3ZpZXcvMzM3OTYvMTQ4NjMvQ2FsY3VsYXRlLUlTTy04NjAxLXdlZWstYW5kLXllYXItaW4tamF2YXNjcmlwdC5odG1sXHJcbiAqXHJcbiAqIEBwYXJhbSAge09iamVjdH0gYGRhdGVgXHJcbiAqIEByZXR1cm4ge051bWJlcn1cclxuICovXHJcbmZ1bmN0aW9uIGdldFdlZWsoZGF0ZSkge1xyXG4gIC8vIFJlbW92ZSB0aW1lIGNvbXBvbmVudHMgb2YgZGF0ZVxyXG4gIHZhciB0YXJnZXRUaHVyc2RheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSk7XHJcblxyXG4gIC8vIENoYW5nZSBkYXRlIHRvIFRodXJzZGF5IHNhbWUgd2Vla1xyXG4gIHRhcmdldFRodXJzZGF5LnNldERhdGUodGFyZ2V0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKCh0YXJnZXRUaHVyc2RheS5nZXREYXkoKSArIDYpICUgNykgKyAzKTtcclxuXHJcbiAgLy8gVGFrZSBKYW51YXJ5IDR0aCBhcyBpdCBpcyBhbHdheXMgaW4gd2VlayAxIChzZWUgSVNPIDg2MDEpXHJcbiAgdmFyIGZpcnN0VGh1cnNkYXkgPSBuZXcgRGF0ZSh0YXJnZXRUaHVyc2RheS5nZXRGdWxsWWVhcigpLCAwLCA0KTtcclxuXHJcbiAgLy8gQ2hhbmdlIGRhdGUgdG8gVGh1cnNkYXkgc2FtZSB3ZWVrXHJcbiAgZmlyc3RUaHVyc2RheS5zZXREYXRlKGZpcnN0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKChmaXJzdFRodXJzZGF5LmdldERheSgpICsgNikgJSA3KSArIDMpO1xyXG5cclxuICAvLyBDaGVjayBpZiBkYXlsaWdodC1zYXZpbmctdGltZS1zd2l0Y2ggb2NjdXJyZWQgYW5kIGNvcnJlY3QgZm9yIGl0XHJcbiAgdmFyIGRzID0gdGFyZ2V0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIGZpcnN0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICB0YXJnZXRUaHVyc2RheS5zZXRIb3Vycyh0YXJnZXRUaHVyc2RheS5nZXRIb3VycygpIC0gZHMpO1xyXG5cclxuICAvLyBOdW1iZXIgb2Ygd2Vla3MgYmV0d2VlbiB0YXJnZXQgVGh1cnNkYXkgYW5kIGZpcnN0IFRodXJzZGF5XHJcbiAgdmFyIHdlZWtEaWZmID0gKHRhcmdldFRodXJzZGF5IC0gZmlyc3RUaHVyc2RheSkgLyAoODY0MDAwMDAqNyk7XHJcbiAgcmV0dXJuIDEgKyBNYXRoLmZsb29yKHdlZWtEaWZmKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBJU08tODYwMSBudW1lcmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXkgb2YgdGhlIHdlZWtcclxuICogMSAoZm9yIE1vbmRheSkgdGhyb3VnaCA3IChmb3IgU3VuZGF5KVxyXG4gKiBcclxuICogQHBhcmFtICB7T2JqZWN0fSBgZGF0ZWBcclxuICogQHJldHVybiB7TnVtYmVyfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RGF5T2ZXZWVrKGRhdGUpIHtcclxuICB2YXIgZG93ID0gZGF0ZS5nZXREYXkoKTtcclxuICBpZihkb3cgPT09IDApIHtcclxuICAgIGRvdyA9IDc7XHJcbiAgfVxyXG4gIHJldHVybiBkb3c7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBraW5kLW9mIHNob3J0Y3V0XHJcbiAqIEBwYXJhbSAgeyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBraW5kT2YodmFsKSB7XHJcbiAgaWYgKHZhbCA9PT0gbnVsbCkge1xyXG4gICAgcmV0dXJuICdudWxsJztcclxuICB9XHJcblxyXG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgcmV0dXJuICd1bmRlZmluZWQnO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbDtcclxuICB9XHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcclxuICAgIHJldHVybiAnYXJyYXknO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwodmFsKVxyXG4gICAgLnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpO1xyXG59O1xyXG5cclxuXHJcblxyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBkYXRlRm9ybWF0O1xyXG4gICAgfSk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZGF0ZUZvcm1hdDtcclxuICB9IGVsc2Uge1xyXG4gICAgZ2xvYmFsLmRhdGVGb3JtYXQgPSBkYXRlRm9ybWF0O1xyXG4gIH1cclxufSkodGhpcyk7XHJcbiIsIi8qKlxuICogbWFya2VkIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE4LCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZFxuICovXG5cbjsoZnVuY3Rpb24ocm9vdCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eXFxuKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rXFxuKikrLyxcbiAgZmVuY2VzOiBub29wLFxuICBocjogL14gezAsM30oKD86LSAqKXszLH18KD86XyAqKXszLH18KD86XFwqICopezMsfSkoPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICooW15cXG5dKz8pICooPzojKyAqKT8oPzpcXG4rfCQpLyxcbiAgbnB0YWJsZTogbm9vcCxcbiAgYmxvY2txdW90ZTogL14oIHswLDN9PiA/KHBhcmFncmFwaHxbXlxcbl0qKSg/OlxcbnwkKSkrLyxcbiAgbGlzdDogL14oIHswLDN9KShidWxsKSBbXFxzXFxTXSs/KD86aHJ8ZGVmfFxcbnsyLH0oPyEgKSg/IVxcMWJ1bGwgKVxcbip8XFxzKiQpLyxcbiAgaHRtbDogJ14gezAsM30oPzonIC8vIG9wdGlvbmFsIGluZGVudGF0aW9uXG4gICAgKyAnPChzY3JpcHR8cHJlfHN0eWxlKVtcXFxccz5dW1xcXFxzXFxcXFNdKj8oPzo8L1xcXFwxPlteXFxcXG5dKlxcXFxuK3wkKScgLy8gKDEpXG4gICAgKyAnfGNvbW1lbnRbXlxcXFxuXSooXFxcXG4rfCQpJyAvLyAoMilcbiAgICArICd8PFxcXFw/W1xcXFxzXFxcXFNdKj9cXFxcPz5cXFxcbionIC8vICgzKVxuICAgICsgJ3w8IVtBLVpdW1xcXFxzXFxcXFNdKj8+XFxcXG4qJyAvLyAoNClcbiAgICArICd8PCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qP1xcXFxdXFxcXF0+XFxcXG4qJyAvLyAoNSlcbiAgICArICd8PC8/KHRhZykoPzogK3xcXFxcbnwvPz4pW1xcXFxzXFxcXFNdKj8oPzpcXFxcbnsyLH18JCknIC8vICg2KVxuICAgICsgJ3w8KD8hc2NyaXB0fHByZXxzdHlsZSkoW2Etel1bXFxcXHctXSopKD86YXR0cmlidXRlKSo/ICovPz4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/OlxcXFxuezIsfXwkKScgLy8gKDcpIG9wZW4gdGFnXG4gICAgKyAnfDwvKD8hc2NyaXB0fHByZXxzdHlsZSlbYS16XVtcXFxcdy1dKlxcXFxzKj4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/OlxcXFxuezIsfXwkKScgLy8gKDcpIGNsb3NpbmcgdGFnXG4gICAgKyAnKScsXG4gIGRlZjogL14gezAsM31cXFsobGFiZWwpXFxdOiAqXFxuPyAqPD8oW15cXHM+XSspPj8oPzooPzogK1xcbj8gKnwgKlxcbiAqKSh0aXRsZSkpPyAqKD86XFxuK3wkKS8sXG4gIHRhYmxlOiBub29wLFxuICBsaGVhZGluZzogL14oW15cXG5dKylcXG4gKig9fC0pezIsfSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogL14oW15cXG5dKyg/Olxcbig/IWhyfGhlYWRpbmd8bGhlYWRpbmd8IHswLDN9Pnw8XFwvPyg/OnRhZykoPzogK3xcXG58XFwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfCEtLSkpW15cXG5dKykqKS8sXG4gIHRleHQ6IC9eW15cXG5dKy9cbn07XG5cbmJsb2NrLl9sYWJlbCA9IC8oPyFcXHMqXFxdKSg/OlxcXFxbXFxbXFxdXXxbXlxcW1xcXV0pKy87XG5ibG9jay5fdGl0bGUgPSAvKD86XCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8J1teJ1xcbl0qKD86XFxuW14nXFxuXSspKlxcbj8nfFxcKFteKCldKlxcKSkvO1xuYmxvY2suZGVmID0gZWRpdChibG9jay5kZWYpXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGJsb2NrLl9sYWJlbClcbiAgLnJlcGxhY2UoJ3RpdGxlJywgYmxvY2suX3RpdGxlKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suYnVsbGV0ID0gLyg/OlsqKy1dfFxcZHsxLDl9XFwuKS87XG5ibG9jay5pdGVtID0gL14oICopKGJ1bGwpID9bXlxcbl0qKD86XFxuKD8hXFwxYnVsbCA/KVteXFxuXSopKi87XG5ibG9jay5pdGVtID0gZWRpdChibG9jay5pdGVtLCAnZ20nKVxuICAucmVwbGFjZSgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5saXN0ID0gZWRpdChibG9jay5saXN0KVxuICAucmVwbGFjZSgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gIC5yZXBsYWNlKCdocicsICdcXFxcbisoPz1cXFxcMT8oPzooPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpKScpXG4gIC5yZXBsYWNlKCdkZWYnLCAnXFxcXG4rKD89JyArIGJsb2NrLmRlZi5zb3VyY2UgKyAnKScpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5fdGFnID0gJ2FkZHJlc3N8YXJ0aWNsZXxhc2lkZXxiYXNlfGJhc2Vmb250fGJsb2NrcXVvdGV8Ym9keXxjYXB0aW9uJ1xuICArICd8Y2VudGVyfGNvbHxjb2xncm91cHxkZHxkZXRhaWxzfGRpYWxvZ3xkaXJ8ZGl2fGRsfGR0fGZpZWxkc2V0fGZpZ2NhcHRpb24nXG4gICsgJ3xmaWd1cmV8Zm9vdGVyfGZvcm18ZnJhbWV8ZnJhbWVzZXR8aFsxLTZdfGhlYWR8aGVhZGVyfGhyfGh0bWx8aWZyYW1lJ1xuICArICd8bGVnZW5kfGxpfGxpbmt8bWFpbnxtZW51fG1lbnVpdGVtfG1ldGF8bmF2fG5vZnJhbWVzfG9sfG9wdGdyb3VwfG9wdGlvbidcbiAgKyAnfHB8cGFyYW18c2VjdGlvbnxzb3VyY2V8c3VtbWFyeXx0YWJsZXx0Ym9keXx0ZHx0Zm9vdHx0aHx0aGVhZHx0aXRsZXx0cidcbiAgKyAnfHRyYWNrfHVsJztcbmJsb2NrLl9jb21tZW50ID0gLzwhLS0oPyEtPz4pW1xcc1xcU10qPy0tPi87XG5ibG9jay5odG1sID0gZWRpdChibG9jay5odG1sLCAnaScpXG4gIC5yZXBsYWNlKCdjb21tZW50JywgYmxvY2suX2NvbW1lbnQpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKVxuICAucmVwbGFjZSgnYXR0cmlidXRlJywgLyArW2EtekEtWjpfXVtcXHcuOi1dKig/OiAqPSAqXCJbXlwiXFxuXSpcInwgKj0gKidbXidcXG5dKid8ICo9ICpbXlxcc1wiJz08PmBdKyk/LylcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLnBhcmFncmFwaCA9IGVkaXQoYmxvY2sucGFyYWdyYXBoKVxuICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgLnJlcGxhY2UoJ2hlYWRpbmcnLCBibG9jay5oZWFkaW5nKVxuICAucmVwbGFjZSgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHBhcnMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gZWRpdChibG9jay5ibG9ja3F1b3RlKVxuICAucmVwbGFjZSgncGFyYWdyYXBoJywgYmxvY2sucGFyYWdyYXBoKVxuICAuZ2V0UmVnZXgoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGZlbmNlczogL14gezAsM30oYHszLH18fnszLH0pKFteYFxcbl0qKVxcbig/OnwoW1xcc1xcU10qPylcXG4pKD86IHswLDN9XFwxW35gXSogKig/Olxcbit8JCl8JCkvLFxuICBwYXJhZ3JhcGg6IC9eLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICsoW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS9cbn0pO1xuXG5ibG9jay5nZm0ucGFyYWdyYXBoID0gZWRpdChibG9jay5wYXJhZ3JhcGgpXG4gIC5yZXBsYWNlKCcoPyEnLCAnKD8hJ1xuICAgICsgYmxvY2suZ2ZtLmZlbmNlcy5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDInKSArICd8J1xuICAgICsgYmxvY2subGlzdC5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDMnKSArICd8JylcbiAgLmdldFJlZ2V4KCk7XG5cbi8qKlxuICogR0ZNICsgVGFibGVzIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay50YWJsZXMgPSBtZXJnZSh7fSwgYmxvY2suZ2ZtLCB7XG4gIG5wdGFibGU6IC9eICooW158XFxuIF0uKlxcfC4qKVxcbiAqKFstOl0rICpcXHxbLXwgOl0qKSg/OlxcbigoPzouKltePlxcbiBdLiooPzpcXG58JCkpKilcXG4qfCQpLyxcbiAgdGFibGU6IC9eICpcXHwoLispXFxuICpcXHw/KCAqWy06XStbLXwgOl0qKSg/OlxcbigoPzogKltePlxcbiBdLiooPzpcXG58JCkpKilcXG4qfCQpL1xufSk7XG5cbi8qKlxuICogUGVkYW50aWMgZ3JhbW1hclxuICovXG5cbmJsb2NrLnBlZGFudGljID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICBodG1sOiBlZGl0KFxuICAgICdeICooPzpjb21tZW50ICooPzpcXFxcbnxcXFxccyokKSdcbiAgICArICd8PCh0YWcpW1xcXFxzXFxcXFNdKz88L1xcXFwxPiAqKD86XFxcXG57Mix9fFxcXFxzKiQpJyAvLyBjbG9zZWQgdGFnXG4gICAgKyAnfDx0YWcoPzpcIlteXCJdKlwifFxcJ1teXFwnXSpcXCd8XFxcXHNbXlxcJ1wiLz5cXFxcc10qKSo/Lz8+ICooPzpcXFxcbnsyLH18XFxcXHMqJCkpJylcbiAgICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAgIC5yZXBsYWNlKC90YWcvZywgJyg/ISg/OidcbiAgICAgICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlfHZhcnxzYW1wfGtiZHxzdWInXG4gICAgICArICd8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKSdcbiAgICAgICsgJ1xcXFxiKVxcXFx3Kyg/ITp8W15cXFxcd1xcXFxzQF0qQClcXFxcYicpXG4gICAgLmdldFJlZ2V4KCksXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICsoW1wiKF1bXlxcbl0rW1wiKV0pKT8gKig/Olxcbit8JCkvXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5ydWxlcyA9IGJsb2NrLm5vcm1hbDtcblxuICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgdGhpcy5ydWxlcyA9IGJsb2NrLnBlZGFudGljO1xuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRhYmxlcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLnRhYmxlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLmdmbTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgQmxvY2sgUnVsZXNcbiAqL1xuXG5MZXhlci5ydWxlcyA9IGJsb2NrO1xuXG4vKipcbiAqIFN0YXRpYyBMZXggTWV0aG9kXG4gKi9cblxuTGV4ZXIubGV4ID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xufTtcblxuLyoqXG4gKiBQcmVwcm9jZXNzaW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKHNyYykge1xuICBzcmMgPSBzcmNcbiAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJylcbiAgICAucmVwbGFjZSgvXFx0L2csICcgICAgJylcbiAgICAucmVwbGFjZSgvXFx1MDBhMC9nLCAnICcpXG4gICAgLnJlcGxhY2UoL1xcdTI0MjQvZywgJ1xcbicpO1xuXG4gIHJldHVybiB0aGlzLnRva2VuKHNyYywgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIExleGluZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS50b2tlbiA9IGZ1bmN0aW9uKHNyYywgdG9wKSB7XG4gIHNyYyA9IHNyYy5yZXBsYWNlKC9eICskL2dtLCAnJyk7XG4gIHZhciBuZXh0LFxuICAgICAgbG9vc2UsXG4gICAgICBjYXAsXG4gICAgICBidWxsLFxuICAgICAgYixcbiAgICAgIGl0ZW0sXG4gICAgICBsaXN0U3RhcnQsXG4gICAgICBsaXN0SXRlbXMsXG4gICAgICB0LFxuICAgICAgc3BhY2UsXG4gICAgICBpLFxuICAgICAgdGFnLFxuICAgICAgbCxcbiAgICAgIGlzb3JkZXJlZCxcbiAgICAgIGlzdGFzayxcbiAgICAgIGlzY2hlY2tlZDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gbmV3bGluZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLm5ld2xpbmUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFswXS5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdzcGFjZSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gezR9L2dtLCAnJyk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgPyBydHJpbShjYXAsICdcXG4nKVxuICAgICAgICAgIDogY2FwXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGZlbmNlcyAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmZlbmNlcy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICBsYW5nOiBjYXBbMl0gPyBjYXBbMl0udHJpbSgpIDogY2FwWzJdLFxuICAgICAgICB0ZXh0OiBjYXBbM10gfHwgJydcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQ6IGNhcFsyXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSBubyBsZWFkaW5nIHBpcGUgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkge1xuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBzcGxpdENlbGxzKGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdID8gY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpIDogW11cbiAgICAgIH07XG5cbiAgICAgIGlmIChpdGVtLmhlYWRlci5sZW5ndGggPT09IGl0ZW0uYWxpZ24ubGVuZ3RoKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpdGVtLmNlbGxzW2ldID0gc3BsaXRDZWxscyhpdGVtLmNlbGxzW2ldLCBpdGVtLmhlYWRlci5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcbiAgICAgIGlzb3JkZXJlZCA9IGJ1bGwubGVuZ3RoID4gMTtcblxuICAgICAgbGlzdFN0YXJ0ID0ge1xuICAgICAgICB0eXBlOiAnbGlzdF9zdGFydCcsXG4gICAgICAgIG9yZGVyZWQ6IGlzb3JkZXJlZCxcbiAgICAgICAgc3RhcnQ6IGlzb3JkZXJlZCA/ICtidWxsIDogJycsXG4gICAgICAgIGxvb3NlOiBmYWxzZVxuICAgICAgfTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaChsaXN0U3RhcnQpO1xuXG4gICAgICAvLyBHZXQgZWFjaCB0b3AtbGV2ZWwgaXRlbS5cbiAgICAgIGNhcCA9IGNhcFswXS5tYXRjaCh0aGlzLnJ1bGVzLml0ZW0pO1xuXG4gICAgICBsaXN0SXRlbXMgPSBbXTtcbiAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgIGwgPSBjYXAubGVuZ3RoO1xuICAgICAgaSA9IDA7XG5cbiAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBjYXBbaV07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0IGl0ZW0ncyBidWxsZXRcbiAgICAgICAgLy8gc28gaXQgaXMgc2VlbiBhcyB0aGUgbmV4dCB0b2tlbi5cbiAgICAgICAgc3BhY2UgPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXiAqKFsqKy1dfFxcZCtcXC4pICovLCAnJyk7XG5cbiAgICAgICAgLy8gT3V0ZGVudCB3aGF0ZXZlciB0aGVcbiAgICAgICAgLy8gbGlzdCBpdGVtIGNvbnRhaW5zLiBIYWNreS5cbiAgICAgICAgaWYgKH5pdGVtLmluZGV4T2YoJ1xcbiAnKSkge1xuICAgICAgICAgIHNwYWNlIC09IGl0ZW0ubGVuZ3RoO1xuICAgICAgICAgIGl0ZW0gPSAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgICA/IGl0ZW0ucmVwbGFjZShuZXcgUmVnRXhwKCdeIHsxLCcgKyBzcGFjZSArICd9JywgJ2dtJyksICcnKVxuICAgICAgICAgICAgOiBpdGVtLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBuZXh0IGxpc3QgaXRlbSBiZWxvbmdzIGhlcmUuXG4gICAgICAgIC8vIEJhY2twZWRhbCBpZiBpdCBkb2VzIG5vdCBiZWxvbmcgaW4gdGhpcyBsaXN0LlxuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBiID0gYmxvY2suYnVsbGV0LmV4ZWMoY2FwW2kgKyAxXSlbMF07XG4gICAgICAgICAgaWYgKGJ1bGwubGVuZ3RoID4gMSA/IGIubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA6IChiLmxlbmd0aCA+IDEgfHwgKHRoaXMub3B0aW9ucy5zbWFydExpc3RzICYmIGIgIT09IGJ1bGwpKSkge1xuICAgICAgICAgICAgc3JjID0gY2FwLnNsaWNlKGkgKyAxKS5qb2luKCdcXG4nKSArIHNyYztcbiAgICAgICAgICAgIGkgPSBsIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciBpdGVtIGlzIGxvb3NlIG9yIG5vdC5cbiAgICAgICAgLy8gVXNlOiAvKF58XFxuKSg/ISApW15cXG5dK1xcblxcbig/IVxccyokKS9cbiAgICAgICAgLy8gZm9yIGRpc2NvdW50IGJlaGF2aW9yLlxuICAgICAgICBsb29zZSA9IG5leHQgfHwgL1xcblxcbig/IVxccyokKS8udGVzdChpdGVtKTtcbiAgICAgICAgaWYgKGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgbmV4dCA9IGl0ZW0uY2hhckF0KGl0ZW0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nO1xuICAgICAgICAgIGlmICghbG9vc2UpIGxvb3NlID0gbmV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb29zZSkge1xuICAgICAgICAgIGxpc3RTdGFydC5sb29zZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgdGFzayBsaXN0IGl0ZW1zXG4gICAgICAgIGlzdGFzayA9IC9eXFxbWyB4WF1cXF0gLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpc2NoZWNrZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChpc3Rhc2spIHtcbiAgICAgICAgICBpc2NoZWNrZWQgPSBpdGVtWzFdICE9PSAnICc7XG4gICAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXlxcW1sgeFhdXFxdICsvLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0ID0ge1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW1fc3RhcnQnLFxuICAgICAgICAgIHRhc2s6IGlzdGFzayxcbiAgICAgICAgICBjaGVja2VkOiBpc2NoZWNrZWQsXG4gICAgICAgICAgbG9vc2U6IGxvb3NlXG4gICAgICAgIH07XG5cbiAgICAgICAgbGlzdEl0ZW1zLnB1c2godCk7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2godCk7XG5cbiAgICAgICAgLy8gUmVjdXJzZS5cbiAgICAgICAgdGhpcy50b2tlbihpdGVtLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbV9lbmQnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAobGlzdFN0YXJ0Lmxvb3NlKSB7XG4gICAgICAgIGwgPSBsaXN0SXRlbXMubGVuZ3RoO1xuICAgICAgICBpID0gMDtcbiAgICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBsaXN0SXRlbXNbaV0ubG9vc2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlZlxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMuZGVmLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzNdKSBjYXBbM10gPSBjYXBbM10uc3Vic3RyaW5nKDEsIGNhcFszXS5sZW5ndGggLSAxKTtcbiAgICAgIHRhZyA9IGNhcFsxXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGlmICghdGhpcy50b2tlbnMubGlua3NbdGFnXSkge1xuICAgICAgICB0aGlzLnRva2Vucy5saW5rc1t0YWddID0ge1xuICAgICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRhYmxlLmV4ZWMoc3JjKSkge1xuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBzcGxpdENlbGxzKGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdID8gY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpIDogW11cbiAgICAgIH07XG5cbiAgICAgIGlmIChpdGVtLmhlYWRlci5sZW5ndGggPT09IGl0ZW0uYWxpZ24ubGVuZ3RoKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpdGVtLmNlbGxzW2ldID0gc3BsaXRDZWxscyhcbiAgICAgICAgICAgIGl0ZW0uY2VsbHNbaV0ucmVwbGFjZSgvXiAqXFx8ICp8ICpcXHwgKiQvZywgJycpLFxuICAgICAgICAgICAgaXRlbS5oZWFkZXIubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzJdID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnBhcmFncmFwaC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICB0ZXh0OiBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIC8vIFRvcC1sZXZlbCBzaG91bGQgbmV2ZXIgcmVhY2ggaGVyZS5cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFshXCIjJCUmJygpKissXFwtLi86Ozw9Pj9AXFxbXFxdXFxcXF5fYHt8fX5dKS8sXG4gIGF1dG9saW5rOiAvXjwoc2NoZW1lOlteXFxzXFx4MDAtXFx4MWY8Pl0qfGVtYWlsKT4vLFxuICB1cmw6IG5vb3AsXG4gIHRhZzogJ15jb21tZW50J1xuICAgICsgJ3xePC9bYS16QS1aXVtcXFxcdzotXSpcXFxccyo+JyAvLyBzZWxmLWNsb3NpbmcgdGFnXG4gICAgKyAnfF48W2EtekEtWl1bXFxcXHctXSooPzphdHRyaWJ1dGUpKj9cXFxccyovPz4nIC8vIG9wZW4gdGFnXG4gICAgKyAnfF48XFxcXD9bXFxcXHNcXFxcU10qP1xcXFw/PicgLy8gcHJvY2Vzc2luZyBpbnN0cnVjdGlvbiwgZS5nLiA8P3BocCA/PlxuICAgICsgJ3xePCFbYS16QS1aXStcXFxcc1tcXFxcc1xcXFxTXSo/PicgLy8gZGVjbGFyYXRpb24sIGUuZy4gPCFET0NUWVBFIGh0bWw+XG4gICAgKyAnfF48IVxcXFxbQ0RBVEFcXFxcW1tcXFxcc1xcXFxTXSo/XFxcXF1cXFxcXT4nLCAvLyBDREFUQSBzZWN0aW9uXG4gIGxpbms6IC9eIT9cXFsobGFiZWwpXFxdXFwoaHJlZig/OlxccysodGl0bGUpKT9cXHMqXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhsYWJlbClcXF1cXFsoPyFcXHMqXFxdKSgoPzpcXFxcW1xcW1xcXV0/fFteXFxbXFxdXFxcXF0pKylcXF0vLFxuICBub2xpbms6IC9eIT9cXFsoPyFcXHMqXFxdKSgoPzpcXFtbXlxcW1xcXV0qXFxdfFxcXFxbXFxbXFxdXXxbXlxcW1xcXV0pKilcXF0oPzpcXFtcXF0pPy8sXG4gIHN0cm9uZzogL15fXyhbXlxcc19dKV9fKD8hXyl8XlxcKlxcKihbXlxccypdKVxcKlxcKig/IVxcKil8Xl9fKFteXFxzXVtcXHNcXFNdKj9bXlxcc10pX18oPyFfKXxeXFwqXFwqKFteXFxzXVtcXHNcXFNdKj9bXlxcc10pXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oW15cXHNfXSlfKD8hXyl8XlxcKihbXlxccypcIjxcXFtdKVxcKig/IVxcKil8Xl8oW15cXHNdW1xcc1xcU10qP1teXFxzX10pXyg/IV98W15cXHNwdW5jdHVhdGlvbl0pfF5fKFteXFxzX11bXFxzXFxTXSo/W15cXHNdKV8oPyFffFteXFxzcHVuY3R1YXRpb25dKXxeXFwqKFteXFxzXCI8XFxbXVtcXHNcXFNdKj9bXlxccypdKVxcKig/IVxcKil8XlxcKihbXlxccypcIjxcXFtdW1xcc1xcU10qP1teXFxzXSlcXCooPyFcXCopLyxcbiAgY29kZTogL14oYCspKFteYF18W15gXVtcXHNcXFNdKj9bXmBdKVxcMSg/IWApLyxcbiAgYnI6IC9eKCB7Mix9fFxcXFwpXFxuKD8hXFxzKiQpLyxcbiAgZGVsOiBub29wLFxuICB0ZXh0OiAvXihgK3xbXmBdKSg/OltcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCpdfFxcYl98JCl8W14gXSg/PSB7Mix9XFxuKSl8KD89IHsyLH1cXG4pKS9cbn07XG5cbi8vIGxpc3Qgb2YgcHVuY3R1YXRpb24gbWFya3MgZnJvbSBjb21tb24gbWFyayBzcGVjXG4vLyB3aXRob3V0IGAgYW5kIF0gdG8gd29ya2Fyb3VuZCBSdWxlIDE3IChpbmxpbmUgY29kZSBibG9ja3MvbGlua3MpXG5pbmxpbmUuX3B1bmN0dWF0aW9uID0gJyFcIiMkJSZcXCcoKSorLFxcXFwtLi86Ozw9Pj9AXFxcXFteX3t8fX4nO1xuaW5saW5lLmVtID0gZWRpdChpbmxpbmUuZW0pLnJlcGxhY2UoL3B1bmN0dWF0aW9uL2csIGlubGluZS5fcHVuY3R1YXRpb24pLmdldFJlZ2V4KCk7XG5cbmlubGluZS5fZXNjYXBlcyA9IC9cXFxcKFshXCIjJCUmJygpKissXFwtLi86Ozw9Pj9AXFxbXFxdXFxcXF5fYHt8fX5dKS9nO1xuXG5pbmxpbmUuX3NjaGVtZSA9IC9bYS16QS1aXVthLXpBLVowLTkrLi1dezEsMzF9LztcbmlubGluZS5fZW1haWwgPSAvW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXSsoQClbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyg/IVstX10pLztcbmlubGluZS5hdXRvbGluayA9IGVkaXQoaW5saW5lLmF1dG9saW5rKVxuICAucmVwbGFjZSgnc2NoZW1lJywgaW5saW5lLl9zY2hlbWUpXG4gIC5yZXBsYWNlKCdlbWFpbCcsIGlubGluZS5fZW1haWwpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2F0dHJpYnV0ZSA9IC9cXHMrW2EtekEtWjpfXVtcXHcuOi1dKig/Olxccyo9XFxzKlwiW15cIl0qXCJ8XFxzKj1cXHMqJ1teJ10qJ3xcXHMqPVxccypbXlxcc1wiJz08PmBdKyk/LztcblxuaW5saW5lLnRhZyA9IGVkaXQoaW5saW5lLnRhZylcbiAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBibG9jay5fY29tbWVudClcbiAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIGlubGluZS5fYXR0cmlidXRlKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9sYWJlbCA9IC8oPzpcXFtbXlxcW1xcXV0qXFxdfFxcXFxbXFxbXFxdXT98YFteYF0qYHxgKD8hYCl8W15cXFtcXF1cXFxcYF0pKj8vO1xuaW5saW5lLl9ocmVmID0gL1xccyooPCg/OlxcXFxbPD5dP3xbXlxcczw+XFxcXF0pKj58W15cXHNcXHgwMC1cXHgxZl0qKS87XG5pbmxpbmUuX3RpdGxlID0gL1wiKD86XFxcXFwiP3xbXlwiXFxcXF0pKlwifCcoPzpcXFxcJz98W14nXFxcXF0pKid8XFwoKD86XFxcXFxcKT98W14pXFxcXF0pKlxcKS87XG5cbmlubGluZS5saW5rID0gZWRpdChpbmxpbmUubGluaylcbiAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgLnJlcGxhY2UoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gIC5yZXBsYWNlKCd0aXRsZScsIGlubGluZS5fdGl0bGUpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUucmVmbGluayA9IGVkaXQoaW5saW5lLnJlZmxpbmspXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gIC5nZXRSZWdleCgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSBtZXJnZSh7fSwgaW5saW5lKTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIHN0cm9uZzogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pfF5cXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKS8sXG4gIGxpbms6IGVkaXQoL14hP1xcWyhsYWJlbClcXF1cXCgoLio/KVxcKS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgICAuZ2V0UmVnZXgoKSxcbiAgcmVmbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxccypcXFsoW15cXF1dKilcXF0vKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gICAgLmdldFJlZ2V4KClcbn0pO1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBlc2NhcGU6IGVkaXQoaW5saW5lLmVzY2FwZSkucmVwbGFjZSgnXSknLCAnfnxdKScpLmdldFJlZ2V4KCksXG4gIF9leHRlbmRlZF9lbWFpbDogL1tBLVphLXowLTkuXystXSsoQClbYS16QS1aMC05LV9dKyg/OlxcLlthLXpBLVowLTktX10qW2EtekEtWjAtOV0pKyg/IVstX10pLyxcbiAgdXJsOiAvXigoPzpmdHB8aHR0cHM/KTpcXC9cXC98d3d3XFwuKSg/OlthLXpBLVowLTlcXC1dK1xcLj8pK1teXFxzPF0qfF5lbWFpbC8sXG4gIF9iYWNrcGVkYWw6IC8oPzpbXj8hLiw6OypffigpJl0rfFxcKFteKV0qXFwpfCYoPyFbYS16QS1aMC05XSs7JCl8Wz8hLiw6OypffildKyg/ISQpKSsvLFxuICBkZWw6IC9efisoPz1cXFMpKFtcXHNcXFNdKj9cXFMpfisvLFxuICB0ZXh0OiAvXihgK3xbXmBdKSg/OltcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCp+XXxcXGJffGh0dHBzPzpcXC9cXC98ZnRwOlxcL1xcL3x3d3dcXC58JCl8W14gXSg/PSB7Mix9XFxuKXxbXmEtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXSg/PVthLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0rQCkpfCg/PSB7Mix9XFxufFthLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0rQCkpL1xufSk7XG5cbmlubGluZS5nZm0udXJsID0gZWRpdChpbmxpbmUuZ2ZtLnVybCwgJ2knKVxuICAucmVwbGFjZSgnZW1haWwnLCBpbmxpbmUuZ2ZtLl9leHRlbmRlZF9lbWFpbClcbiAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IG1lcmdlKHt9LCBpbmxpbmUuZ2ZtLCB7XG4gIGJyOiBlZGl0KGlubGluZS5icikucmVwbGFjZSgnezIsfScsICcqJykuZ2V0UmVnZXgoKSxcbiAgdGV4dDogZWRpdChpbmxpbmUuZ2ZtLnRleHQpLnJlcGxhY2UoL1xcezIsXFx9L2csICcqJykuZ2V0UmVnZXgoKVxufSk7XG5cbi8qKlxuICogSW5saW5lIExleGVyICYgQ29tcGlsZXJcbiAqL1xuXG5mdW5jdGlvbiBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5saW5rcyA9IGxpbmtzO1xuICB0aGlzLnJ1bGVzID0gaW5saW5lLm5vcm1hbDtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXIoKTtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gIGlmICghdGhpcy5saW5rcykge1xuICAgIHRocm93IG5ldyBFcnJvcignVG9rZW5zIGFycmF5IHJlcXVpcmVzIGEgYGxpbmtzYCBwcm9wZXJ0eS4nKTtcbiAgfVxuXG4gIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICB0aGlzLnJ1bGVzID0gaW5saW5lLnBlZGFudGljO1xuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmJyZWFrcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5icmVha3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuZ2ZtO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBJbmxpbmUgUnVsZXNcbiAqL1xuXG5JbmxpbmVMZXhlci5ydWxlcyA9IGlubGluZTtcblxuLyoqXG4gKiBTdGF0aWMgTGV4aW5nL0NvbXBpbGluZyBNZXRob2RcbiAqL1xuXG5JbmxpbmVMZXhlci5vdXRwdXQgPSBmdW5jdGlvbihzcmMsIGxpbmtzLCBvcHRpb25zKSB7XG4gIHZhciBpbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpO1xuICByZXR1cm4gaW5saW5lLm91dHB1dChzcmMpO1xufTtcblxuLyoqXG4gKiBMZXhpbmcvQ29tcGlsaW5nXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKHNyYykge1xuICB2YXIgb3V0ID0gJycsXG4gICAgICBsaW5rLFxuICAgICAgdGV4dCxcbiAgICAgIGhyZWYsXG4gICAgICB0aXRsZSxcbiAgICAgIGNhcCxcbiAgICAgIHByZXZDYXBaZXJvO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBlc2NhcGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lc2NhcGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFnXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGFnLmV4ZWMoc3JjKSkge1xuICAgICAgaWYgKCF0aGlzLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaW5SYXdCbG9jayAmJiAvXjwocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5SYXdCbG9jayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5SYXdCbG9jayAmJiAvXjxcXC8ocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5SYXdCbG9jayA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKVxuICAgICAgICAgIDogZXNjYXBlKGNhcFswXSlcbiAgICAgICAgOiBjYXBbMF07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGluay5leGVjKHNyYykpIHtcbiAgICAgIHZhciBsYXN0UGFyZW5JbmRleCA9IGZpbmRDbG9zaW5nQnJhY2tldChjYXBbMl0sICcoKScpO1xuICAgICAgaWYgKGxhc3RQYXJlbkluZGV4ID4gLTEpIHtcbiAgICAgICAgdmFyIGxpbmtMZW4gPSBjYXBbMF0ubGVuZ3RoIC0gKGNhcFsyXS5sZW5ndGggLSBsYXN0UGFyZW5JbmRleCkgLSAoY2FwWzNdIHx8ICcnKS5sZW5ndGg7XG4gICAgICAgIGNhcFsyXSA9IGNhcFsyXS5zdWJzdHJpbmcoMCwgbGFzdFBhcmVuSW5kZXgpO1xuICAgICAgICBjYXBbMF0gPSBjYXBbMF0uc3Vic3RyaW5nKDAsIGxpbmtMZW4pLnRyaW0oKTtcbiAgICAgICAgY2FwWzNdID0gJyc7XG4gICAgICB9XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgaHJlZiA9IGNhcFsyXTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgbGluayA9IC9eKFteJ1wiXSpbXlxcc10pXFxzKyhbJ1wiXSkoLiopXFwyLy5leGVjKGhyZWYpO1xuXG4gICAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgICAgaHJlZiA9IGxpbmtbMV07XG4gICAgICAgICAgdGl0bGUgPSBsaW5rWzNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRpdGxlID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnNsaWNlKDEsIC0xKSA6ICcnO1xuICAgICAgfVxuICAgICAgaHJlZiA9IGhyZWYudHJpbSgpLnJlcGxhY2UoL148KFtcXHNcXFNdKik+JC8sICckMScpO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogSW5saW5lTGV4ZXIuZXNjYXBlcyhocmVmKSxcbiAgICAgICAgdGl0bGU6IElubGluZUxleGVyLmVzY2FwZXModGl0bGUpXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gdGhpcy5saW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rIHx8ICFsaW5rLmhyZWYpIHtcbiAgICAgICAgb3V0ICs9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHNyYyA9IGNhcFswXS5zdWJzdHJpbmcoMSkgKyBzcmM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIGxpbmspO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHN0cm9uZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnN0cm9uZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5zdHJvbmcodGhpcy5vdXRwdXQoY2FwWzRdIHx8IGNhcFszXSB8fCBjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBlbVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVtLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmVtKHRoaXMub3V0cHV0KGNhcFs2XSB8fCBjYXBbNV0gfHwgY2FwWzRdIHx8IGNhcFszXSB8fCBjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2Rlc3Bhbihlc2NhcGUoY2FwWzJdLnRyaW0oKSwgdHJ1ZSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYnJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ici5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5icigpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVsIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZGVsLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmRlbCh0aGlzLm91dHB1dChjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGF1dG9saW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYXV0b2xpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5tYW5nbGUoY2FwWzFdKSk7XG4gICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB1cmwgKGdmbSlcbiAgICBpZiAoIXRoaXMuaW5MaW5rICYmIChjYXAgPSB0aGlzLnJ1bGVzLnVybC5leGVjKHNyYykpKSB7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMF0pO1xuICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvIGV4dGVuZGVkIGF1dG9saW5rIHBhdGggdmFsaWRhdGlvblxuICAgICAgICBkbyB7XG4gICAgICAgICAgcHJldkNhcFplcm8gPSBjYXBbMF07XG4gICAgICAgICAgY2FwWzBdID0gdGhpcy5ydWxlcy5fYmFja3BlZGFsLmV4ZWMoY2FwWzBdKVswXTtcbiAgICAgICAgfSB3aGlsZSAocHJldkNhcFplcm8gIT09IGNhcFswXSk7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzBdKTtcbiAgICAgICAgaWYgKGNhcFsxXSA9PT0gJ3d3dy4nKSB7XG4gICAgICAgICAgaHJlZiA9ICdodHRwOi8vJyArIHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKHRoaXMuaW5SYXdCbG9jaykge1xuICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50ZXh0KGNhcFswXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50ZXh0KGVzY2FwZSh0aGlzLnNtYXJ0eXBhbnRzKGNhcFswXSkpKTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG5JbmxpbmVMZXhlci5lc2NhcGVzID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dCA/IHRleHQucmVwbGFjZShJbmxpbmVMZXhlci5ydWxlcy5fZXNjYXBlcywgJyQxJykgOiB0ZXh0O1xufTtcblxuLyoqXG4gKiBDb21waWxlIExpbmtcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0TGluayA9IGZ1bmN0aW9uKGNhcCwgbGluaykge1xuICB2YXIgaHJlZiA9IGxpbmsuaHJlZixcbiAgICAgIHRpdGxlID0gbGluay50aXRsZSA/IGVzY2FwZShsaW5rLnRpdGxlKSA6IG51bGw7XG5cbiAgcmV0dXJuIGNhcFswXS5jaGFyQXQoMCkgIT09ICchJ1xuICAgID8gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIHRpdGxlLCB0aGlzLm91dHB1dChjYXBbMV0pKVxuICAgIDogdGhpcy5yZW5kZXJlci5pbWFnZShocmVmLCB0aXRsZSwgZXNjYXBlKGNhcFsxXSkpO1xufTtcblxuLyoqXG4gKiBTbWFydHlwYW50cyBUcmFuc2Zvcm1hdGlvbnNcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUuc21hcnR5cGFudHMgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzKSByZXR1cm4gdGV4dDtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn07XG5cbi8qKlxuICogTWFuZ2xlIExpbmtzXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm1hbmdsZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMubWFuZ2xlKSByZXR1cm4gdGV4dDtcbiAgdmFyIG91dCA9ICcnLFxuICAgICAgbCA9IHRleHQubGVuZ3RoLFxuICAgICAgaSA9IDAsXG4gICAgICBjaDtcblxuICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgIGNoID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBjaCA9ICd4JyArIGNoLnRvU3RyaW5nKDE2KTtcbiAgICB9XG4gICAgb3V0ICs9ICcmIycgKyBjaCArICc7JztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cblxuZnVuY3Rpb24gUmVuZGVyZXIob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbn1cblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGUgPSBmdW5jdGlvbihjb2RlLCBpbmZvc3RyaW5nLCBlc2NhcGVkKSB7XG4gIHZhciBsYW5nID0gKGluZm9zdHJpbmcgfHwgJycpLm1hdGNoKC9cXFMqLylbMF07XG4gIGlmICh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KSB7XG4gICAgdmFyIG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgaWYgKG91dCAhPSBudWxsICYmIG91dCAhPT0gY29kZSkge1xuICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgICBjb2RlID0gb3V0O1xuICAgIH1cbiAgfVxuXG4gIGlmICghbGFuZykge1xuICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJzwvY29kZT48L3ByZT4nO1xuICB9XG5cbiAgcmV0dXJuICc8cHJlPjxjb2RlIGNsYXNzPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICArIGVzY2FwZShsYW5nLCB0cnVlKVxuICAgICsgJ1wiPidcbiAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ibG9ja3F1b3RlID0gZnVuY3Rpb24ocXVvdGUpIHtcbiAgcmV0dXJuICc8YmxvY2txdW90ZT5cXG4nICsgcXVvdGUgKyAnPC9ibG9ja3F1b3RlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWw7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaGVhZGluZyA9IGZ1bmN0aW9uKHRleHQsIGxldmVsLCByYXcsIHNsdWdnZXIpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5oZWFkZXJJZHMpIHtcbiAgICByZXR1cm4gJzxoJ1xuICAgICAgKyBsZXZlbFxuICAgICAgKyAnIGlkPVwiJ1xuICAgICAgKyB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4XG4gICAgICArIHNsdWdnZXIuc2x1ZyhyYXcpXG4gICAgICArICdcIj4nXG4gICAgICArIHRleHRcbiAgICAgICsgJzwvaCdcbiAgICAgICsgbGV2ZWxcbiAgICAgICsgJz5cXG4nO1xuICB9XG4gIC8vIGlnbm9yZSBJRHNcbiAgcmV0dXJuICc8aCcgKyBsZXZlbCArICc+JyArIHRleHQgKyAnPC9oJyArIGxldmVsICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbihib2R5LCBvcmRlcmVkLCBzdGFydCkge1xuICB2YXIgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJyxcbiAgICAgIHN0YXJ0YXR0ID0gKG9yZGVyZWQgJiYgc3RhcnQgIT09IDEpID8gKCcgc3RhcnQ9XCInICsgc3RhcnQgKyAnXCInKSA6ICcnO1xuICByZXR1cm4gJzwnICsgdHlwZSArIHN0YXJ0YXR0ICsgJz5cXG4nICsgYm9keSArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3RpdGVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxsaT4nICsgdGV4dCArICc8L2xpPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuY2hlY2tib3ggPSBmdW5jdGlvbihjaGVja2VkKSB7XG4gIHJldHVybiAnPGlucHV0ICdcbiAgICArIChjaGVja2VkID8gJ2NoZWNrZWQ9XCJcIiAnIDogJycpXG4gICAgKyAnZGlzYWJsZWQ9XCJcIiB0eXBlPVwiY2hlY2tib3hcIidcbiAgICArICh0aGlzLm9wdGlvbnMueGh0bWwgPyAnIC8nIDogJycpXG4gICAgKyAnPiAnO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8cD4nICsgdGV4dCArICc8L3A+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZSA9IGZ1bmN0aW9uKGhlYWRlciwgYm9keSkge1xuICBpZiAoYm9keSkgYm9keSA9ICc8dGJvZHk+JyArIGJvZHkgKyAnPC90Ym9keT4nO1xuXG4gIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICArICc8dGhlYWQ+XFxuJ1xuICAgICsgaGVhZGVyXG4gICAgKyAnPC90aGVhZD5cXG4nXG4gICAgKyBib2R5XG4gICAgKyAnPC90YWJsZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlcm93ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gJzx0cj5cXG4nICsgY29udGVudCArICc8L3RyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVjZWxsID0gZnVuY3Rpb24oY29udGVudCwgZmxhZ3MpIHtcbiAgdmFyIHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgdmFyIHRhZyA9IGZsYWdzLmFsaWduXG4gICAgPyAnPCcgKyB0eXBlICsgJyBhbGlnbj1cIicgKyBmbGFncy5hbGlnbiArICdcIj4nXG4gICAgOiAnPCcgKyB0eXBlICsgJz4nO1xuICByZXR1cm4gdGFnICsgY29udGVudCArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuLy8gc3BhbiBsZXZlbCByZW5kZXJlclxuUmVuZGVyZXIucHJvdG90eXBlLnN0cm9uZyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8c3Ryb25nPicgKyB0ZXh0ICsgJzwvc3Ryb25nPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGVtPicgKyB0ZXh0ICsgJzwvZW0+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2Rlc3BhbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8Y29kZT4nICsgdGV4dCArICc8L2NvZGU+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5iciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxici8+JyA6ICc8YnI+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5kZWwgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGRlbD4nICsgdGV4dCArICc8L2RlbD4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpbmsgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICBocmVmID0gY2xlYW5VcmwodGhpcy5vcHRpb25zLnNhbml0aXplLCB0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gIGlmIChocmVmID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cbiAgdmFyIG91dCA9ICc8YSBocmVmPVwiJyArIGVzY2FwZShocmVmKSArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5pbWFnZSA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGhyZWYgPSBjbGVhblVybCh0aGlzLm9wdGlvbnMuc2FuaXRpemUsIHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgaWYgKGhyZWYgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIHZhciBvdXQgPSAnPGltZyBzcmM9XCInICsgaHJlZiArICdcIiBhbHQ9XCInICsgdGV4dCArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dDtcbn07XG5cbi8qKlxuICogVGV4dFJlbmRlcmVyXG4gKiByZXR1cm5zIG9ubHkgdGhlIHRleHR1YWwgcGFydCBvZiB0aGUgdG9rZW5cbiAqL1xuXG5mdW5jdGlvbiBUZXh0UmVuZGVyZXIoKSB7fVxuXG4vLyBubyBuZWVkIGZvciBibG9jayBsZXZlbCByZW5kZXJlcnNcblxuVGV4dFJlbmRlcmVyLnByb3RvdHlwZS5zdHJvbmcgPVxuVGV4dFJlbmRlcmVyLnByb3RvdHlwZS5lbSA9XG5UZXh0UmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID1cblRleHRSZW5kZXJlci5wcm90b3R5cGUuZGVsID1cblRleHRSZW5kZXJlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gIHJldHVybiB0ZXh0O1xufTtcblxuVGV4dFJlbmRlcmVyLnByb3RvdHlwZS5saW5rID1cblRleHRSZW5kZXJlci5wcm90b3R5cGUuaW1hZ2UgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICByZXR1cm4gJycgKyB0ZXh0O1xufTtcblxuVGV4dFJlbmRlcmVyLnByb3RvdHlwZS5iciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJyc7XG59O1xuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2VuID0gbnVsbDtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXIoKTtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICB0aGlzLnNsdWdnZXIgPSBuZXcgU2x1Z2dlcigpO1xufVxuXG4vKipcbiAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAqL1xuXG5QYXJzZXIucGFyc2UgPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMpIHtcbiAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucyk7XG4gIHJldHVybiBwYXJzZXIucGFyc2Uoc3JjKTtcbn07XG5cbi8qKlxuICogUGFyc2UgTG9vcFxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihzcmMpIHtcbiAgdGhpcy5pbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIoc3JjLmxpbmtzLCB0aGlzLm9wdGlvbnMpO1xuICAvLyB1c2UgYW4gSW5saW5lTGV4ZXIgd2l0aCBhIFRleHRSZW5kZXJlciB0byBleHRyYWN0IHB1cmUgdGV4dFxuICB0aGlzLmlubGluZVRleHQgPSBuZXcgSW5saW5lTGV4ZXIoXG4gICAgc3JjLmxpbmtzLFxuICAgIG1lcmdlKHt9LCB0aGlzLm9wdGlvbnMsIHtyZW5kZXJlcjogbmV3IFRleHRSZW5kZXJlcigpfSlcbiAgKTtcbiAgdGhpcy50b2tlbnMgPSBzcmMucmV2ZXJzZSgpO1xuXG4gIHZhciBvdXQgPSAnJztcbiAgd2hpbGUgKHRoaXMubmV4dCgpKSB7XG4gICAgb3V0ICs9IHRoaXMudG9rKCk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2VuID0gdGhpcy50b2tlbnMucG9wKCk7XG59O1xuXG4vKipcbiAqIFByZXZpZXcgTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy50b2tlbnMubGVuZ3RoIC0gMV0gfHwgMDtcbn07XG5cbi8qKlxuICogUGFyc2UgVGV4dCBUb2tlbnNcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlVGV4dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYm9keSA9IHRoaXMudG9rZW4udGV4dDtcblxuICB3aGlsZSAodGhpcy5wZWVrKCkudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgYm9keSArPSAnXFxuJyArIHRoaXMubmV4dCgpLnRleHQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5pbmxpbmUub3V0cHV0KGJvZHkpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBDdXJyZW50IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS50b2sgPSBmdW5jdGlvbigpIHtcbiAgc3dpdGNoICh0aGlzLnRva2VuLnR5cGUpIHtcbiAgICBjYXNlICdzcGFjZSc6IHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY2FzZSAnaHInOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ocigpO1xuICAgIH1cbiAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaGVhZGluZyhcbiAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCksXG4gICAgICAgIHRoaXMudG9rZW4uZGVwdGgsXG4gICAgICAgIHVuZXNjYXBlKHRoaXMuaW5saW5lVGV4dC5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSksXG4gICAgICAgIHRoaXMuc2x1Z2dlcik7XG4gICAgfVxuICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5jb2RlKHRoaXMudG9rZW4udGV4dCxcbiAgICAgICAgdGhpcy50b2tlbi5sYW5nLFxuICAgICAgICB0aGlzLnRva2VuLmVzY2FwZWQpO1xuICAgIH1cbiAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgIHZhciBoZWFkZXIgPSAnJyxcbiAgICAgICAgICBib2R5ID0gJycsXG4gICAgICAgICAgaSxcbiAgICAgICAgICByb3csXG4gICAgICAgICAgY2VsbCxcbiAgICAgICAgICBqO1xuXG4gICAgICAvLyBoZWFkZXJcbiAgICAgIGNlbGwgPSAnJztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmhlYWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLmhlYWRlcltpXSksXG4gICAgICAgICAgeyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICByb3cgPSB0aGlzLnRva2VuLmNlbGxzW2ldO1xuXG4gICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQocm93W2pdKSxcbiAgICAgICAgICAgIHsgaGVhZGVyOiBmYWxzZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25bal0gfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci50YWJsZShoZWFkZXIsIGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdibG9ja3F1b3RlX3N0YXJ0Jzoge1xuICAgICAgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICBib2R5ID0gJyc7XG4gICAgICB2YXIgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZCxcbiAgICAgICAgICBzdGFydCA9IHRoaXMudG9rZW4uc3RhcnQ7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkLCBzdGFydCk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6IHtcbiAgICAgIGJvZHkgPSAnJztcbiAgICAgIHZhciBsb29zZSA9IHRoaXMudG9rZW4ubG9vc2U7XG4gICAgICB2YXIgY2hlY2tlZCA9IHRoaXMudG9rZW4uY2hlY2tlZDtcbiAgICAgIHZhciB0YXNrID0gdGhpcy50b2tlbi50YXNrO1xuXG4gICAgICBpZiAodGhpcy50b2tlbi50YXNrKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci5jaGVja2JveChjaGVja2VkKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9ICFsb29zZSAmJiB0aGlzLnRva2VuLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgID8gdGhpcy5wYXJzZVRleHQoKVxuICAgICAgICAgIDogdGhpcy50b2soKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHksIHRhc2ssIGNoZWNrZWQpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgLy8gVE9ETyBwYXJzZSBpbmxpbmUgY29udGVudCBpZiBwYXJhbWV0ZXIgbWFya2Rvd249MVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbCh0aGlzLnRva2VuLnRleHQpO1xuICAgIH1cbiAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCkpO1xuICAgIH1cbiAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VUZXh0KCkpO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICB2YXIgZXJyTXNnID0gJ1Rva2VuIHdpdGggXCInICsgdGhpcy50b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyTXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBTbHVnZ2VyIGdlbmVyYXRlcyBoZWFkZXIgaWRcbiAqL1xuXG5mdW5jdGlvbiBTbHVnZ2VyICgpIHtcbiAgdGhpcy5zZWVuID0ge307XG59XG5cbi8qKlxuICogQ29udmVydCBzdHJpbmcgdG8gdW5pcXVlIGlkXG4gKi9cblxuU2x1Z2dlci5wcm90b3R5cGUuc2x1ZyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgc2x1ZyA9IHZhbHVlXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAudHJpbSgpXG4gICAgLnJlcGxhY2UoL1tcXHUyMDAwLVxcdTIwNkZcXHUyRTAwLVxcdTJFN0ZcXFxcJyFcIiMkJSYoKSorLC4vOjs8PT4/QFtcXF1eYHt8fX5dL2csICcnKVxuICAgIC5yZXBsYWNlKC9cXHMvZywgJy0nKTtcblxuICBpZiAodGhpcy5zZWVuLmhhc093blByb3BlcnR5KHNsdWcpKSB7XG4gICAgdmFyIG9yaWdpbmFsU2x1ZyA9IHNsdWc7XG4gICAgZG8ge1xuICAgICAgdGhpcy5zZWVuW29yaWdpbmFsU2x1Z10rKztcbiAgICAgIHNsdWcgPSBvcmlnaW5hbFNsdWcgKyAnLScgKyB0aGlzLnNlZW5bb3JpZ2luYWxTbHVnXTtcbiAgICB9IHdoaWxlICh0aGlzLnNlZW4uaGFzT3duUHJvcGVydHkoc2x1ZykpO1xuICB9XG4gIHRoaXMuc2VlbltzbHVnXSA9IDA7XG5cbiAgcmV0dXJuIHNsdWc7XG59O1xuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuXG5mdW5jdGlvbiBlc2NhcGUoaHRtbCwgZW5jb2RlKSB7XG4gIGlmIChlbmNvZGUpIHtcbiAgICBpZiAoZXNjYXBlLmVzY2FwZVRlc3QudGVzdChodG1sKSkge1xuICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShlc2NhcGUuZXNjYXBlUmVwbGFjZSwgZnVuY3Rpb24gKGNoKSB7IHJldHVybiBlc2NhcGUucmVwbGFjZW1lbnRzW2NoXTsgfSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChlc2NhcGUuZXNjYXBlVGVzdE5vRW5jb2RlLnRlc3QoaHRtbCkpIHtcbiAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoZXNjYXBlLmVzY2FwZVJlcGxhY2VOb0VuY29kZSwgZnVuY3Rpb24gKGNoKSB7IHJldHVybiBlc2NhcGUucmVwbGFjZW1lbnRzW2NoXTsgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGh0bWw7XG59XG5cbmVzY2FwZS5lc2NhcGVUZXN0ID0gL1smPD5cIiddLztcbmVzY2FwZS5lc2NhcGVSZXBsYWNlID0gL1smPD5cIiddL2c7XG5lc2NhcGUucmVwbGFjZW1lbnRzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xuXG5lc2NhcGUuZXNjYXBlVGVzdE5vRW5jb2RlID0gL1s8PlwiJ118Jig/ISM/XFx3KzspLztcbmVzY2FwZS5lc2NhcGVSZXBsYWNlTm9FbmNvZGUgPSAvWzw+XCInXXwmKD8hIz9cXHcrOykvZztcblxuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuICAvLyBleHBsaWNpdGx5IG1hdGNoIGRlY2ltYWwsIGhleCwgYW5kIG5hbWVkIEhUTUwgZW50aXRpZXNcbiAgcmV0dXJuIGh0bWwucmVwbGFjZSgvJigjKD86XFxkKyl8KD86I3hbMC05QS1GYS1mXSspfCg/OlxcdyspKTs/L2lnLCBmdW5jdGlvbihfLCBuKSB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBlZGl0KHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2UgfHwgcmVnZXg7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgcmV0dXJuIHtcbiAgICByZXBsYWNlOiBmdW5jdGlvbihuYW1lLCB2YWwpIHtcbiAgICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgICAgdmFsID0gdmFsLnJlcGxhY2UoLyhefFteXFxbXSlcXF4vZywgJyQxJyk7XG4gICAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0UmVnZXg6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgsIG9wdCk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBjbGVhblVybChzYW5pdGl6ZSwgYmFzZSwgaHJlZikge1xuICBpZiAoc2FuaXRpemUpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKC9bXlxcdzpdL2csICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHByb3QuaW5kZXhPZignamF2YXNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ3Zic2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZignZGF0YTonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGlmIChiYXNlICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwoYmFzZSwgaHJlZik7XG4gIH1cbiAgdHJ5IHtcbiAgICBocmVmID0gZW5jb2RlVVJJKGhyZWYpLnJlcGxhY2UoLyUyNS9nLCAnJScpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGhyZWY7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikge1xuICBpZiAoIWJhc2VVcmxzWycgJyArIGJhc2VdKSB7XG4gICAgLy8gd2UgY2FuIGlnbm9yZSBldmVyeXRoaW5nIGluIGJhc2UgYWZ0ZXIgdGhlIGxhc3Qgc2xhc2ggb2YgaXRzIHBhdGggY29tcG9uZW50LFxuICAgIC8vIGJ1dCB3ZSBtaWdodCBuZWVkIHRvIGFkZCBfdGhhdF9cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTNcbiAgICBpZiAoL15bXjpdKzpcXC8qW14vXSokLy50ZXN0KGJhc2UpKSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UgKyAnLyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gcnRyaW0oYmFzZSwgJy8nLCB0cnVlKTtcbiAgICB9XG4gIH1cbiAgYmFzZSA9IGJhc2VVcmxzWycgJyArIGJhc2VdO1xuXG4gIGlmIChocmVmLnNsaWNlKDAsIDIpID09PSAnLy8nKSB7XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZSgvOltcXHNcXFNdKi8sICc6JykgKyBocmVmO1xuICB9IGVsc2UgaWYgKGhyZWYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC8oOlxcLypbXi9dKilbXFxzXFxTXSovLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2UgKyBocmVmO1xuICB9XG59XG52YXIgYmFzZVVybHMgPSB7fTtcbnZhciBvcmlnaW5JbmRlcGVuZGVudFVybCA9IC9eJHxeW2Etel1bYS16MC05Ky4tXSo6fF5bPyNdL2k7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxubm9vcC5leGVjID0gbm9vcDtcblxuZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gIHZhciBpID0gMSxcbiAgICAgIHRhcmdldCxcbiAgICAgIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gc3BsaXRDZWxscyh0YWJsZVJvdywgY291bnQpIHtcbiAgLy8gZW5zdXJlIHRoYXQgZXZlcnkgY2VsbC1kZWxpbWl0aW5nIHBpcGUgaGFzIGEgc3BhY2VcbiAgLy8gYmVmb3JlIGl0IHRvIGRpc3Rpbmd1aXNoIGl0IGZyb20gYW4gZXNjYXBlZCBwaXBlXG4gIHZhciByb3cgPSB0YWJsZVJvdy5yZXBsYWNlKC9cXHwvZywgZnVuY3Rpb24gKG1hdGNoLCBvZmZzZXQsIHN0cikge1xuICAgICAgICB2YXIgZXNjYXBlZCA9IGZhbHNlLFxuICAgICAgICAgICAgY3VyciA9IG9mZnNldDtcbiAgICAgICAgd2hpbGUgKC0tY3VyciA+PSAwICYmIHN0cltjdXJyXSA9PT0gJ1xcXFwnKSBlc2NhcGVkID0gIWVzY2FwZWQ7XG4gICAgICAgIGlmIChlc2NhcGVkKSB7XG4gICAgICAgICAgLy8gb2RkIG51bWJlciBvZiBzbGFzaGVzIG1lYW5zIHwgaXMgZXNjYXBlZFxuICAgICAgICAgIC8vIHNvIHdlIGxlYXZlIGl0IGFsb25lXG4gICAgICAgICAgcmV0dXJuICd8JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBhZGQgc3BhY2UgYmVmb3JlIHVuZXNjYXBlZCB8XG4gICAgICAgICAgcmV0dXJuICcgfCc7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgY2VsbHMgPSByb3cuc3BsaXQoLyBcXHwvKSxcbiAgICAgIGkgPSAwO1xuXG4gIGlmIChjZWxscy5sZW5ndGggPiBjb3VudCkge1xuICAgIGNlbGxzLnNwbGljZShjb3VudCk7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKGNlbGxzLmxlbmd0aCA8IGNvdW50KSBjZWxscy5wdXNoKCcnKTtcbiAgfVxuXG4gIGZvciAoOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2UgaXMgaWdub3JlZCBwZXIgdGhlIGdmbSBzcGVjXG4gICAgY2VsbHNbaV0gPSBjZWxsc1tpXS50cmltKCkucmVwbGFjZSgvXFxcXFxcfC9nLCAnfCcpO1xuICB9XG4gIHJldHVybiBjZWxscztcbn1cblxuLy8gUmVtb3ZlIHRyYWlsaW5nICdjJ3MuIEVxdWl2YWxlbnQgdG8gc3RyLnJlcGxhY2UoL2MqJC8sICcnKS5cbi8vIC9jKiQvIGlzIHZ1bG5lcmFibGUgdG8gUkVET1MuXG4vLyBpbnZlcnQ6IFJlbW92ZSBzdWZmaXggb2Ygbm9uLWMgY2hhcnMgaW5zdGVhZC4gRGVmYXVsdCBmYWxzZXkuXG5mdW5jdGlvbiBydHJpbShzdHIsIGMsIGludmVydCkge1xuICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8vIExlbmd0aCBvZiBzdWZmaXggbWF0Y2hpbmcgdGhlIGludmVydCBjb25kaXRpb24uXG4gIHZhciBzdWZmTGVuID0gMDtcblxuICAvLyBTdGVwIGxlZnQgdW50aWwgd2UgZmFpbCB0byBtYXRjaCB0aGUgaW52ZXJ0IGNvbmRpdGlvbi5cbiAgd2hpbGUgKHN1ZmZMZW4gPCBzdHIubGVuZ3RoKSB7XG4gICAgdmFyIGN1cnJDaGFyID0gc3RyLmNoYXJBdChzdHIubGVuZ3RoIC0gc3VmZkxlbiAtIDEpO1xuICAgIGlmIChjdXJyQ2hhciA9PT0gYyAmJiAhaW52ZXJ0KSB7XG4gICAgICBzdWZmTGVuKys7XG4gICAgfSBlbHNlIGlmIChjdXJyQ2hhciAhPT0gYyAmJiBpbnZlcnQpIHtcbiAgICAgIHN1ZmZMZW4rKztcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0ci5zdWJzdHIoMCwgc3RyLmxlbmd0aCAtIHN1ZmZMZW4pO1xufVxuXG5mdW5jdGlvbiBmaW5kQ2xvc2luZ0JyYWNrZXQoc3RyLCBiKSB7XG4gIGlmIChzdHIuaW5kZXhPZihiWzFdKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgdmFyIGxldmVsID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3RyW2ldID09PSAnXFxcXCcpIHtcbiAgICAgIGkrKztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PT0gYlswXSkge1xuICAgICAgbGV2ZWwrKztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PT0gYlsxXSkge1xuICAgICAgbGV2ZWwtLTtcbiAgICAgIGlmIChsZXZlbCA8IDApIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBNYXJrZWRcbiAqL1xuXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIC8vIHRocm93IGVycm9yIGluIGNhc2Ugb2Ygbm9uIHN0cmluZyBpbnB1dFxuICBpZiAodHlwZW9mIHNyYyA9PT0gJ3VuZGVmaW5lZCcgfHwgc3JjID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZWQoKTogaW5wdXQgcGFyYW1ldGVyIGlzIHVuZGVmaW5lZCBvciBudWxsJyk7XG4gIH1cbiAgaWYgKHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZWQoKTogaW5wdXQgcGFyYW1ldGVyIGlzIG9mIHR5cGUgJ1xuICAgICAgKyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3JjKSArICcsIHN0cmluZyBleHBlY3RlZCcpO1xuICB9XG5cbiAgaWYgKGNhbGxiYWNrIHx8IHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcblxuICAgIHZhciBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0LFxuICAgICAgICB0b2tlbnMsXG4gICAgICAgIHBlbmRpbmcsXG4gICAgICAgIGkgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgIH1cblxuICAgIHBlbmRpbmcgPSB0b2tlbnMubGVuZ3RoO1xuXG4gICAgdmFyIGRvbmUgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9XG5cbiAgICAgIHZhciBvdXQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG91dCA9IFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVyciA9IGU7XG4gICAgICB9XG5cbiAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG5cbiAgICAgIHJldHVybiBlcnJcbiAgICAgICAgPyBjYWxsYmFjayhlcnIpXG4gICAgICAgIDogY2FsbGJhY2sobnVsbCwgb3V0KTtcbiAgICB9O1xuXG4gICAgaWYgKCFoaWdobGlnaHQgfHwgaGlnaGxpZ2h0Lmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIG9wdC5oaWdobGlnaHQ7XG5cbiAgICBpZiAoIXBlbmRpbmcpIHJldHVybiBkb25lKCk7XG5cbiAgICBmb3IgKDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnY29kZScpIHtcbiAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0KHRva2VuLnRleHQsIHRva2VuLmxhbmcsIGZ1bmN0aW9uKGVyciwgY29kZSkge1xuICAgICAgICAgIGlmIChlcnIpIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgaWYgKGNvZGUgPT0gbnVsbCB8fCBjb2RlID09PSB0b2tlbi50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4udGV4dCA9IGNvZGU7XG4gICAgICAgICAgdG9rZW4uZXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSh0b2tlbnNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGlmIChvcHQpIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZShMZXhlci5sZXgoc3JjLCBvcHQpLCBvcHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZC4nO1xuICAgIGlmICgob3B0IHx8IG1hcmtlZC5kZWZhdWx0cykuc2lsZW50KSB7XG4gICAgICByZXR1cm4gJzxwPkFuIGVycm9yIG9jY3VycmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWVyZ2UobWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIGJhc2VVcmw6IG51bGwsXG4gICAgYnJlYWtzOiBmYWxzZSxcbiAgICBnZm06IHRydWUsXG4gICAgaGVhZGVySWRzOiB0cnVlLFxuICAgIGhlYWRlclByZWZpeDogJycsXG4gICAgaGlnaGxpZ2h0OiBudWxsLFxuICAgIGxhbmdQcmVmaXg6ICdsYW5ndWFnZS0nLFxuICAgIG1hbmdsZTogdHJ1ZSxcbiAgICBwZWRhbnRpYzogZmFsc2UsXG4gICAgcmVuZGVyZXI6IG5ldyBSZW5kZXJlcigpLFxuICAgIHNhbml0aXplOiBmYWxzZSxcbiAgICBzYW5pdGl6ZXI6IG51bGwsXG4gICAgc2lsZW50OiBmYWxzZSxcbiAgICBzbWFydExpc3RzOiBmYWxzZSxcbiAgICBzbWFydHlwYW50czogZmFsc2UsXG4gICAgdGFibGVzOiB0cnVlLFxuICAgIHhodG1sOiBmYWxzZVxuICB9O1xufTtcblxubWFya2VkLmRlZmF1bHRzID0gbWFya2VkLmdldERlZmF1bHRzKCk7XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cblxubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5cbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xubWFya2VkLlRleHRSZW5kZXJlciA9IFRleHRSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQuU2x1Z2dlciA9IFNsdWdnZXI7XG5cbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IG1hcmtlZDtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIG1hcmtlZDsgfSk7XG59IGVsc2Uge1xuICByb290Lm1hcmtlZCA9IG1hcmtlZDtcbn1cbn0pKHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKSk7XG4iLCI7KGZ1bmN0aW9uKCkge1xuXCJ1c2Ugc3RyaWN0XCJcbmZ1bmN0aW9uIFZub2RlKHRhZywga2V5LCBhdHRyczAsIGNoaWxkcmVuLCB0ZXh0LCBkb20pIHtcblx0cmV0dXJuIHt0YWc6IHRhZywga2V5OiBrZXksIGF0dHJzOiBhdHRyczAsIGNoaWxkcmVuOiBjaGlsZHJlbiwgdGV4dDogdGV4dCwgZG9tOiBkb20sIGRvbVNpemU6IHVuZGVmaW5lZCwgc3RhdGU6IHVuZGVmaW5lZCwgX3N0YXRlOiB1bmRlZmluZWQsIGV2ZW50czogdW5kZWZpbmVkLCBpbnN0YW5jZTogdW5kZWZpbmVkLCBza2lwOiBmYWxzZX1cbn1cblZub2RlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHJldHVybiBWbm9kZShcIltcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKG5vZGUpLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcblx0aWYgKG5vZGUgIT0gbnVsbCAmJiB0eXBlb2Ygbm9kZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIFZub2RlKFwiI1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbm9kZSA9PT0gZmFsc2UgPyBcIlwiIDogbm9kZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG5cdHJldHVybiBub2RlXG59XG5Wbm9kZS5ub3JtYWxpemVDaGlsZHJlbiA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRjaGlsZHJlbltpXSA9IFZub2RlLm5vcm1hbGl6ZShjaGlsZHJlbltpXSlcblx0fVxuXHRyZXR1cm4gY2hpbGRyZW5cbn1cbnZhciBzZWxlY3RvclBhcnNlciA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbKC4rPykoPzpcXHMqPVxccyooXCJ8J3wpKCg/OlxcXFxbXCInXFxdXXwuKSo/KVxcNSk/XFxdKS9nXG52YXIgc2VsZWN0b3JDYWNoZSA9IHt9XG52YXIgaGFzT3duID0ge30uaGFzT3duUHJvcGVydHlcbmZ1bmN0aW9uIGNvbXBpbGVTZWxlY3RvcihzZWxlY3Rvcikge1xuXHR2YXIgbWF0Y2gsIHRhZyA9IFwiZGl2XCIsIGNsYXNzZXMgPSBbXSwgYXR0cnMgPSB7fVxuXHR3aGlsZSAobWF0Y2ggPSBzZWxlY3RvclBhcnNlci5leGVjKHNlbGVjdG9yKSkge1xuXHRcdHZhciB0eXBlID0gbWF0Y2hbMV0sIHZhbHVlID0gbWF0Y2hbMl1cblx0XHRpZiAodHlwZSA9PT0gXCJcIiAmJiB2YWx1ZSAhPT0gXCJcIikgdGFnID0gdmFsdWVcblx0XHRlbHNlIGlmICh0eXBlID09PSBcIiNcIikgYXR0cnMuaWQgPSB2YWx1ZVxuXHRcdGVsc2UgaWYgKHR5cGUgPT09IFwiLlwiKSBjbGFzc2VzLnB1c2godmFsdWUpXG5cdFx0ZWxzZSBpZiAobWF0Y2hbM11bMF0gPT09IFwiW1wiKSB7XG5cdFx0XHR2YXIgYXR0clZhbHVlID0gbWF0Y2hbNl1cblx0XHRcdGlmIChhdHRyVmFsdWUpIGF0dHJWYWx1ZSA9IGF0dHJWYWx1ZS5yZXBsYWNlKC9cXFxcKFtcIiddKS9nLCBcIiQxXCIpLnJlcGxhY2UoL1xcXFxcXFxcL2csIFwiXFxcXFwiKVxuXHRcdFx0aWYgKG1hdGNoWzRdID09PSBcImNsYXNzXCIpIGNsYXNzZXMucHVzaChhdHRyVmFsdWUpXG5cdFx0XHRlbHNlIGF0dHJzW21hdGNoWzRdXSA9IGF0dHJWYWx1ZSA9PT0gXCJcIiA/IGF0dHJWYWx1ZSA6IGF0dHJWYWx1ZSB8fCB0cnVlXG5cdFx0fVxuXHR9XG5cdGlmIChjbGFzc2VzLmxlbmd0aCA+IDApIGF0dHJzLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbihcIiBcIilcblx0cmV0dXJuIHNlbGVjdG9yQ2FjaGVbc2VsZWN0b3JdID0ge3RhZzogdGFnLCBhdHRyczogYXR0cnN9XG59XG5mdW5jdGlvbiBleGVjU2VsZWN0b3Ioc3RhdGUsIGF0dHJzLCBjaGlsZHJlbikge1xuXHR2YXIgaGFzQXR0cnMgPSBmYWxzZSwgY2hpbGRMaXN0LCB0ZXh0XG5cdHZhciBjbGFzc05hbWUgPSBhdHRycy5jbGFzc05hbWUgfHwgYXR0cnMuY2xhc3Ncblx0Zm9yICh2YXIga2V5IGluIHN0YXRlLmF0dHJzKSB7XG5cdFx0aWYgKGhhc093bi5jYWxsKHN0YXRlLmF0dHJzLCBrZXkpKSB7XG5cdFx0XHRhdHRyc1trZXldID0gc3RhdGUuYXR0cnNba2V5XVxuXHRcdH1cblx0fVxuXHRpZiAoY2xhc3NOYW1lICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoYXR0cnMuY2xhc3MgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0YXR0cnMuY2xhc3MgPSB1bmRlZmluZWRcblx0XHRcdGF0dHJzLmNsYXNzTmFtZSA9IGNsYXNzTmFtZVxuXHRcdH1cblx0XHRpZiAoc3RhdGUuYXR0cnMuY2xhc3NOYW1lICE9IG51bGwpIHtcblx0XHRcdGF0dHJzLmNsYXNzTmFtZSA9IHN0YXRlLmF0dHJzLmNsYXNzTmFtZSArIFwiIFwiICsgY2xhc3NOYW1lXG5cdFx0fVxuXHR9XG5cdGZvciAodmFyIGtleSBpbiBhdHRycykge1xuXHRcdGlmIChoYXNPd24uY2FsbChhdHRycywga2V5KSAmJiBrZXkgIT09IFwia2V5XCIpIHtcblx0XHRcdGhhc0F0dHJzID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pICYmIGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBjaGlsZHJlblswXSAhPSBudWxsICYmIGNoaWxkcmVuWzBdLnRhZyA9PT0gXCIjXCIpIHtcblx0XHR0ZXh0ID0gY2hpbGRyZW5bMF0uY2hpbGRyZW5cblx0fSBlbHNlIHtcblx0XHRjaGlsZExpc3QgPSBjaGlsZHJlblxuXHR9XG5cdHJldHVybiBWbm9kZShzdGF0ZS50YWcsIGF0dHJzLmtleSwgaGFzQXR0cnMgPyBhdHRycyA6IHVuZGVmaW5lZCwgY2hpbGRMaXN0LCB0ZXh0KVxufVxuZnVuY3Rpb24gaHlwZXJzY3JpcHQoc2VsZWN0b3IpIHtcblx0Ly8gQmVjYXVzZSBzbG9wcHkgbW9kZSBzdWNrc1xuXHR2YXIgYXR0cnMgPSBhcmd1bWVudHNbMV0sIHN0YXJ0ID0gMiwgY2hpbGRyZW5cblx0aWYgKHNlbGVjdG9yID09IG51bGwgfHwgdHlwZW9mIHNlbGVjdG9yICE9PSBcInN0cmluZ1wiICYmIHR5cGVvZiBzZWxlY3RvciAhPT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBzZWxlY3Rvci52aWV3ICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHR0aHJvdyBFcnJvcihcIlRoZSBzZWxlY3RvciBtdXN0IGJlIGVpdGhlciBhIHN0cmluZyBvciBhIGNvbXBvbmVudC5cIik7XG5cdH1cblx0aWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHZhciBjYWNoZWQgPSBzZWxlY3RvckNhY2hlW3NlbGVjdG9yXSB8fCBjb21waWxlU2VsZWN0b3Ioc2VsZWN0b3IpXG5cdH1cblx0aWYgKGF0dHJzID09IG51bGwpIHtcblx0XHRhdHRycyA9IHt9XG5cdH0gZWxzZSBpZiAodHlwZW9mIGF0dHJzICE9PSBcIm9iamVjdFwiIHx8IGF0dHJzLnRhZyAhPSBudWxsIHx8IEFycmF5LmlzQXJyYXkoYXR0cnMpKSB7XG5cdFx0YXR0cnMgPSB7fVxuXHRcdHN0YXJ0ID0gMVxuXHR9XG5cdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSBzdGFydCArIDEpIHtcblx0XHRjaGlsZHJlbiA9IGFyZ3VtZW50c1tzdGFydF1cblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSBjaGlsZHJlbiA9IFtjaGlsZHJlbl1cblx0fSBlbHNlIHtcblx0XHRjaGlsZHJlbiA9IFtdXG5cdFx0d2hpbGUgKHN0YXJ0IDwgYXJndW1lbnRzLmxlbmd0aCkgY2hpbGRyZW4ucHVzaChhcmd1bWVudHNbc3RhcnQrK10pXG5cdH1cblx0dmFyIG5vcm1hbGl6ZWQgPSBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbilcblx0aWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHJldHVybiBleGVjU2VsZWN0b3IoY2FjaGVkLCBhdHRycywgbm9ybWFsaXplZClcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gVm5vZGUoc2VsZWN0b3IsIGF0dHJzLmtleSwgYXR0cnMsIG5vcm1hbGl6ZWQpXG5cdH1cbn1cbmh5cGVyc2NyaXB0LnRydXN0ID0gZnVuY3Rpb24oaHRtbCkge1xuXHRpZiAoaHRtbCA9PSBudWxsKSBodG1sID0gXCJcIlxuXHRyZXR1cm4gVm5vZGUoXCI8XCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBodG1sLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcbn1cbmh5cGVyc2NyaXB0LmZyYWdtZW50ID0gZnVuY3Rpb24oYXR0cnMxLCBjaGlsZHJlbikge1xuXHRyZXR1cm4gVm5vZGUoXCJbXCIsIGF0dHJzMS5rZXksIGF0dHJzMSwgVm5vZGUubm9ybWFsaXplQ2hpbGRyZW4oY2hpbGRyZW4pLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcbn1cbnZhciBtID0gaHlwZXJzY3JpcHRcbi8qKiBAY29uc3RydWN0b3IgKi9cbnZhciBQcm9taXNlUG9seWZpbGwgPSBmdW5jdGlvbihleGVjdXRvcikge1xuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgUHJvbWlzZVBvbHlmaWxsKSkgdGhyb3cgbmV3IEVycm9yKFwiUHJvbWlzZSBtdXN0IGJlIGNhbGxlZCB3aXRoIGBuZXdgXCIpXG5cdGlmICh0eXBlb2YgZXhlY3V0b3IgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcImV4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvblwiKVxuXHR2YXIgc2VsZiA9IHRoaXMsIHJlc29sdmVycyA9IFtdLCByZWplY3RvcnMgPSBbXSwgcmVzb2x2ZUN1cnJlbnQgPSBoYW5kbGVyKHJlc29sdmVycywgdHJ1ZSksIHJlamVjdEN1cnJlbnQgPSBoYW5kbGVyKHJlamVjdG9ycywgZmFsc2UpXG5cdHZhciBpbnN0YW5jZSA9IHNlbGYuX2luc3RhbmNlID0ge3Jlc29sdmVyczogcmVzb2x2ZXJzLCByZWplY3RvcnM6IHJlamVjdG9yc31cblx0dmFyIGNhbGxBc3luYyA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IHNldFRpbWVvdXRcblx0ZnVuY3Rpb24gaGFuZGxlcihsaXN0LCBzaG91bGRBYnNvcmIpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZXhlY3V0ZSh2YWx1ZSkge1xuXHRcdFx0dmFyIHRoZW5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChzaG91bGRBYnNvcmIgJiYgdmFsdWUgIT0gbnVsbCAmJiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSAmJiB0eXBlb2YgKHRoZW4gPSB2YWx1ZS50aGVuKSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlID09PSBzZWxmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJvbWlzZSBjYW4ndCBiZSByZXNvbHZlZCB3LyBpdHNlbGZcIilcblx0XHRcdFx0XHRleGVjdXRlT25jZSh0aGVuLmJpbmQodmFsdWUpKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNhbGxBc3luYyhmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICghc2hvdWxkQWJzb3JiICYmIGxpc3QubGVuZ3RoID09PSAwKSBjb25zb2xlLmVycm9yKFwiUG9zc2libGUgdW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uOlwiLCB2YWx1ZSlcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykgbGlzdFtpXSh2YWx1ZSlcblx0XHRcdFx0XHRcdHJlc29sdmVycy5sZW5ndGggPSAwLCByZWplY3RvcnMubGVuZ3RoID0gMFxuXHRcdFx0XHRcdFx0aW5zdGFuY2Uuc3RhdGUgPSBzaG91bGRBYnNvcmJcblx0XHRcdFx0XHRcdGluc3RhbmNlLnJldHJ5ID0gZnVuY3Rpb24oKSB7ZXhlY3V0ZSh2YWx1ZSl9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpIHtcblx0XHRcdFx0cmVqZWN0Q3VycmVudChlKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBleGVjdXRlT25jZSh0aGVuKSB7XG5cdFx0dmFyIHJ1bnMgPSAwXG5cdFx0ZnVuY3Rpb24gcnVuKGZuKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdFx0aWYgKHJ1bnMrKyA+IDApIHJldHVyblxuXHRcdFx0XHRmbih2YWx1ZSlcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFyIG9uZXJyb3IgPSBydW4ocmVqZWN0Q3VycmVudClcblx0XHR0cnkge3RoZW4ocnVuKHJlc29sdmVDdXJyZW50KSwgb25lcnJvcil9IGNhdGNoIChlKSB7b25lcnJvcihlKX1cblx0fVxuXHRleGVjdXRlT25jZShleGVjdXRvcilcbn1cblByb21pc2VQb2x5ZmlsbC5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGlvbikge1xuXHR2YXIgc2VsZiA9IHRoaXMsIGluc3RhbmNlID0gc2VsZi5faW5zdGFuY2Vcblx0ZnVuY3Rpb24gaGFuZGxlKGNhbGxiYWNrLCBsaXN0LCBuZXh0LCBzdGF0ZSkge1xuXHRcdGxpc3QucHVzaChmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSBuZXh0KHZhbHVlKVxuXHRcdFx0ZWxzZSB0cnkge3Jlc29sdmVOZXh0KGNhbGxiYWNrKHZhbHVlKSl9IGNhdGNoIChlKSB7aWYgKHJlamVjdE5leHQpIHJlamVjdE5leHQoZSl9XG5cdFx0fSlcblx0XHRpZiAodHlwZW9mIGluc3RhbmNlLnJldHJ5ID09PSBcImZ1bmN0aW9uXCIgJiYgc3RhdGUgPT09IGluc3RhbmNlLnN0YXRlKSBpbnN0YW5jZS5yZXRyeSgpXG5cdH1cblx0dmFyIHJlc29sdmVOZXh0LCByZWplY3ROZXh0XG5cdHZhciBwcm9taXNlID0gbmV3IFByb21pc2VQb2x5ZmlsbChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtyZXNvbHZlTmV4dCA9IHJlc29sdmUsIHJlamVjdE5leHQgPSByZWplY3R9KVxuXHRoYW5kbGUob25GdWxmaWxsZWQsIGluc3RhbmNlLnJlc29sdmVycywgcmVzb2x2ZU5leHQsIHRydWUpLCBoYW5kbGUob25SZWplY3Rpb24sIGluc3RhbmNlLnJlamVjdG9ycywgcmVqZWN0TmV4dCwgZmFsc2UpXG5cdHJldHVybiBwcm9taXNlXG59XG5Qcm9taXNlUG9seWZpbGwucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24ob25SZWplY3Rpb24pIHtcblx0cmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbilcbn1cblByb21pc2VQb2x5ZmlsbC5yZXNvbHZlID0gZnVuY3Rpb24odmFsdWUpIHtcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZVBvbHlmaWxsKSByZXR1cm4gdmFsdWVcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSkge3Jlc29sdmUodmFsdWUpfSlcbn1cblByb21pc2VQb2x5ZmlsbC5yZWplY3QgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IFByb21pc2VQb2x5ZmlsbChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtyZWplY3QodmFsdWUpfSlcbn1cblByb21pc2VQb2x5ZmlsbC5hbGwgPSBmdW5jdGlvbihsaXN0KSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdHZhciB0b3RhbCA9IGxpc3QubGVuZ3RoLCBjb3VudCA9IDAsIHZhbHVlcyA9IFtdXG5cdFx0aWYgKGxpc3QubGVuZ3RoID09PSAwKSByZXNvbHZlKFtdKVxuXHRcdGVsc2UgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQoZnVuY3Rpb24oaSkge1xuXHRcdFx0XHRmdW5jdGlvbiBjb25zdW1lKHZhbHVlKSB7XG5cdFx0XHRcdFx0Y291bnQrK1xuXHRcdFx0XHRcdHZhbHVlc1tpXSA9IHZhbHVlXG5cdFx0XHRcdFx0aWYgKGNvdW50ID09PSB0b3RhbCkgcmVzb2x2ZSh2YWx1ZXMpXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGxpc3RbaV0gIT0gbnVsbCAmJiAodHlwZW9mIGxpc3RbaV0gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGxpc3RbaV0gPT09IFwiZnVuY3Rpb25cIikgJiYgdHlwZW9mIGxpc3RbaV0udGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0bGlzdFtpXS50aGVuKGNvbnN1bWUsIHJlamVjdClcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGNvbnN1bWUobGlzdFtpXSlcblx0XHRcdH0pKGkpXG5cdFx0fVxuXHR9KVxufVxuUHJvbWlzZVBvbHlmaWxsLnJhY2UgPSBmdW5jdGlvbihsaXN0KSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGlzdFtpXS50aGVuKHJlc29sdmUsIHJlamVjdClcblx0XHR9XG5cdH0pXG59XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRpZiAodHlwZW9mIHdpbmRvdy5Qcm9taXNlID09PSBcInVuZGVmaW5lZFwiKSB3aW5kb3cuUHJvbWlzZSA9IFByb21pc2VQb2x5ZmlsbFxuXHR2YXIgUHJvbWlzZVBvbHlmaWxsID0gd2luZG93LlByb21pc2Vcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRpZiAodHlwZW9mIGdsb2JhbC5Qcm9taXNlID09PSBcInVuZGVmaW5lZFwiKSBnbG9iYWwuUHJvbWlzZSA9IFByb21pc2VQb2x5ZmlsbFxuXHR2YXIgUHJvbWlzZVBvbHlmaWxsID0gZ2xvYmFsLlByb21pc2Vcbn0gZWxzZSB7XG59XG52YXIgYnVpbGRRdWVyeVN0cmluZyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuXHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgIT09IFwiW29iamVjdCBPYmplY3RdXCIpIHJldHVybiBcIlwiXG5cdHZhciBhcmdzID0gW11cblx0Zm9yICh2YXIga2V5MCBpbiBvYmplY3QpIHtcblx0XHRkZXN0cnVjdHVyZShrZXkwLCBvYmplY3Rba2V5MF0pXG5cdH1cblx0cmV0dXJuIGFyZ3Muam9pbihcIiZcIilcblx0ZnVuY3Rpb24gZGVzdHJ1Y3R1cmUoa2V5MCwgdmFsdWUpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0ZGVzdHJ1Y3R1cmUoa2V5MCArIFwiW1wiICsgaSArIFwiXVwiLCB2YWx1ZVtpXSlcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuXHRcdFx0Zm9yICh2YXIgaSBpbiB2YWx1ZSkge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkwICsgXCJbXCIgKyBpICsgXCJdXCIsIHZhbHVlW2ldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGFyZ3MucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5MCkgKyAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gXCJcIiA/IFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSA6IFwiXCIpKVxuXHR9XG59XG52YXIgRklMRV9QUk9UT0NPTF9SRUdFWCA9IG5ldyBSZWdFeHAoXCJeZmlsZTovL1wiLCBcImlcIilcbnZhciBfOCA9IGZ1bmN0aW9uKCR3aW5kb3csIFByb21pc2UpIHtcblx0dmFyIGNhbGxiYWNrQ291bnQgPSAwXG5cdHZhciBvbmNvbXBsZXRpb25cblx0ZnVuY3Rpb24gc2V0Q29tcGxldGlvbkNhbGxiYWNrKGNhbGxiYWNrKSB7b25jb21wbGV0aW9uID0gY2FsbGJhY2t9XG5cdGZ1bmN0aW9uIGZpbmFsaXplcigpIHtcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0ZnVuY3Rpb24gY29tcGxldGUoKSB7aWYgKC0tY291bnQgPT09IDAgJiYgdHlwZW9mIG9uY29tcGxldGlvbiA9PT0gXCJmdW5jdGlvblwiKSBvbmNvbXBsZXRpb24oKX1cblx0XHRyZXR1cm4gZnVuY3Rpb24gZmluYWxpemUocHJvbWlzZTApIHtcblx0XHRcdHZhciB0aGVuMCA9IHByb21pc2UwLnRoZW5cblx0XHRcdHByb21pc2UwLnRoZW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y291bnQrK1xuXHRcdFx0XHR2YXIgbmV4dCA9IHRoZW4wLmFwcGx5KHByb21pc2UwLCBhcmd1bWVudHMpXG5cdFx0XHRcdG5leHQudGhlbihjb21wbGV0ZSwgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdGNvbXBsZXRlKClcblx0XHRcdFx0XHRpZiAoY291bnQgPT09IDApIHRocm93IGVcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuIGZpbmFsaXplKG5leHQpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTBcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gbm9ybWFsaXplKGFyZ3MsIGV4dHJhKSB7XG5cdFx0aWYgKHR5cGVvZiBhcmdzID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR2YXIgdXJsID0gYXJnc1xuXHRcdFx0YXJncyA9IGV4dHJhIHx8IHt9XG5cdFx0XHRpZiAoYXJncy51cmwgPT0gbnVsbCkgYXJncy51cmwgPSB1cmxcblx0XHR9XG5cdFx0cmV0dXJuIGFyZ3Ncblx0fVxuXHRmdW5jdGlvbiByZXF1ZXN0KGFyZ3MsIGV4dHJhKSB7XG5cdFx0dmFyIGZpbmFsaXplID0gZmluYWxpemVyKClcblx0XHRhcmdzID0gbm9ybWFsaXplKGFyZ3MsIGV4dHJhKVxuXHRcdHZhciBwcm9taXNlMCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0aWYgKGFyZ3MubWV0aG9kID09IG51bGwpIGFyZ3MubWV0aG9kID0gXCJHRVRcIlxuXHRcdFx0YXJncy5tZXRob2QgPSBhcmdzLm1ldGhvZC50b1VwcGVyQ2FzZSgpXG5cdFx0XHR2YXIgdXNlQm9keSA9IChhcmdzLm1ldGhvZCA9PT0gXCJHRVRcIiB8fCBhcmdzLm1ldGhvZCA9PT0gXCJUUkFDRVwiKSA/IGZhbHNlIDogKHR5cGVvZiBhcmdzLnVzZUJvZHkgPT09IFwiYm9vbGVhblwiID8gYXJncy51c2VCb2R5IDogdHJ1ZSlcblx0XHRcdGlmICh0eXBlb2YgYXJncy5zZXJpYWxpemUgIT09IFwiZnVuY3Rpb25cIikgYXJncy5zZXJpYWxpemUgPSB0eXBlb2YgRm9ybURhdGEgIT09IFwidW5kZWZpbmVkXCIgJiYgYXJncy5kYXRhIGluc3RhbmNlb2YgRm9ybURhdGEgPyBmdW5jdGlvbih2YWx1ZSkge3JldHVybiB2YWx1ZX0gOiBKU09OLnN0cmluZ2lmeVxuXHRcdFx0aWYgKHR5cGVvZiBhcmdzLmRlc2VyaWFsaXplICE9PSBcImZ1bmN0aW9uXCIpIGFyZ3MuZGVzZXJpYWxpemUgPSBkZXNlcmlhbGl6ZVxuXHRcdFx0aWYgKHR5cGVvZiBhcmdzLmV4dHJhY3QgIT09IFwiZnVuY3Rpb25cIikgYXJncy5leHRyYWN0ID0gZXh0cmFjdFxuXHRcdFx0YXJncy51cmwgPSBpbnRlcnBvbGF0ZShhcmdzLnVybCwgYXJncy5kYXRhKVxuXHRcdFx0aWYgKHVzZUJvZHkpIGFyZ3MuZGF0YSA9IGFyZ3Muc2VyaWFsaXplKGFyZ3MuZGF0YSlcblx0XHRcdGVsc2UgYXJncy51cmwgPSBhc3NlbWJsZShhcmdzLnVybCwgYXJncy5kYXRhKVxuXHRcdFx0dmFyIHhociA9IG5ldyAkd2luZG93LlhNTEh0dHBSZXF1ZXN0KCksXG5cdFx0XHRcdGFib3J0ZWQgPSBmYWxzZSxcblx0XHRcdFx0X2Fib3J0ID0geGhyLmFib3J0XG5cdFx0XHR4aHIuYWJvcnQgPSBmdW5jdGlvbiBhYm9ydCgpIHtcblx0XHRcdFx0YWJvcnRlZCA9IHRydWVcblx0XHRcdFx0X2Fib3J0LmNhbGwoeGhyKVxuXHRcdFx0fVxuXHRcdFx0eGhyLm9wZW4oYXJncy5tZXRob2QsIGFyZ3MudXJsLCB0eXBlb2YgYXJncy5hc3luYyA9PT0gXCJib29sZWFuXCIgPyBhcmdzLmFzeW5jIDogdHJ1ZSwgdHlwZW9mIGFyZ3MudXNlciA9PT0gXCJzdHJpbmdcIiA/IGFyZ3MudXNlciA6IHVuZGVmaW5lZCwgdHlwZW9mIGFyZ3MucGFzc3dvcmQgPT09IFwic3RyaW5nXCIgPyBhcmdzLnBhc3N3b3JkIDogdW5kZWZpbmVkKVxuXHRcdFx0aWYgKGFyZ3Muc2VyaWFsaXplID09PSBKU09OLnN0cmluZ2lmeSAmJiB1c2VCb2R5KSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZ3MuZGVzZXJpYWxpemUgPT09IGRlc2VyaWFsaXplKSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC8qXCIpXG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJncy53aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSBhcmdzLndpdGhDcmVkZW50aWFsc1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZ3MuaGVhZGVycykgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwoYXJncy5oZWFkZXJzLCBrZXkpKSB7XG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgYXJncy5oZWFkZXJzW2tleV0pXG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuY29uZmlnID09PSBcImZ1bmN0aW9uXCIpIHhociA9IGFyZ3MuY29uZmlnKHhociwgYXJncykgfHwgeGhyXG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vIERvbid0IHRocm93IGVycm9ycyBvbiB4aHIuYWJvcnQoKS5cblx0XHRcdFx0aWYoYWJvcnRlZCkgcmV0dXJuXG5cdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHR2YXIgcmVzcG9uc2UgPSAoYXJncy5leHRyYWN0ICE9PSBleHRyYWN0KSA/IGFyZ3MuZXh0cmFjdCh4aHIsIGFyZ3MpIDogYXJncy5kZXNlcmlhbGl6ZShhcmdzLmV4dHJhY3QoeGhyLCBhcmdzKSlcblx0XHRcdFx0XHRcdGlmICgoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgfHwgeGhyLnN0YXR1cyA9PT0gMzA0IHx8IEZJTEVfUFJPVE9DT0xfUkVHRVgudGVzdChhcmdzLnVybCkpIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShjYXN0KGFyZ3MudHlwZSwgcmVzcG9uc2UpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHZhciBlcnJvciA9IG5ldyBFcnJvcih4aHIucmVzcG9uc2VUZXh0KVxuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gcmVzcG9uc2UpIGVycm9yW2tleV0gPSByZXNwb25zZVtrZXldXG5cdFx0XHRcdFx0XHRcdHJlamVjdChlcnJvcilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdHJlamVjdChlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHVzZUJvZHkgJiYgKGFyZ3MuZGF0YSAhPSBudWxsKSkgeGhyLnNlbmQoYXJncy5kYXRhKVxuXHRcdFx0ZWxzZSB4aHIuc2VuZCgpXG5cdFx0fSlcblx0XHRyZXR1cm4gYXJncy5iYWNrZ3JvdW5kID09PSB0cnVlID8gcHJvbWlzZTAgOiBmaW5hbGl6ZShwcm9taXNlMClcblx0fVxuXHRmdW5jdGlvbiBqc29ucChhcmdzLCBleHRyYSkge1xuXHRcdHZhciBmaW5hbGl6ZSA9IGZpbmFsaXplcigpXG5cdFx0YXJncyA9IG5vcm1hbGl6ZShhcmdzLCBleHRyYSlcblx0XHR2YXIgcHJvbWlzZTAgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdHZhciBjYWxsYmFja05hbWUgPSBhcmdzLmNhbGxiYWNrTmFtZSB8fCBcIl9taXRocmlsX1wiICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMWUxNikgKyBcIl9cIiArIGNhbGxiYWNrQ291bnQrK1xuXHRcdFx0dmFyIHNjcmlwdCA9ICR3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKVxuXHRcdFx0JHdpbmRvd1tjYWxsYmFja05hbWVdID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXG5cdFx0XHRcdHJlc29sdmUoY2FzdChhcmdzLnR5cGUsIGRhdGEpKVxuXHRcdFx0XHRkZWxldGUgJHdpbmRvd1tjYWxsYmFja05hbWVdXG5cdFx0XHR9XG5cdFx0XHRzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXG5cdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoXCJKU09OUCByZXF1ZXN0IGZhaWxlZFwiKSlcblx0XHRcdFx0ZGVsZXRlICR3aW5kb3dbY2FsbGJhY2tOYW1lXVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFyZ3MuZGF0YSA9PSBudWxsKSBhcmdzLmRhdGEgPSB7fVxuXHRcdFx0YXJncy51cmwgPSBpbnRlcnBvbGF0ZShhcmdzLnVybCwgYXJncy5kYXRhKVxuXHRcdFx0YXJncy5kYXRhW2FyZ3MuY2FsbGJhY2tLZXkgfHwgXCJjYWxsYmFja1wiXSA9IGNhbGxiYWNrTmFtZVxuXHRcdFx0c2NyaXB0LnNyYyA9IGFzc2VtYmxlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHQkd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChzY3JpcHQpXG5cdFx0fSlcblx0XHRyZXR1cm4gYXJncy5iYWNrZ3JvdW5kID09PSB0cnVlPyBwcm9taXNlMCA6IGZpbmFsaXplKHByb21pc2UwKVxuXHR9XG5cdGZ1bmN0aW9uIGludGVycG9sYXRlKHVybCwgZGF0YSkge1xuXHRcdGlmIChkYXRhID09IG51bGwpIHJldHVybiB1cmxcblx0XHR2YXIgdG9rZW5zID0gdXJsLm1hdGNoKC86W15cXC9dKy9naSkgfHwgW11cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IHRva2Vuc1tpXS5zbGljZSgxKVxuXHRcdFx0aWYgKGRhdGFba2V5XSAhPSBudWxsKSB7XG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHRva2Vuc1tpXSwgZGF0YVtrZXldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdXJsXG5cdH1cblx0ZnVuY3Rpb24gYXNzZW1ibGUodXJsLCBkYXRhKSB7XG5cdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhkYXRhKVxuXHRcdGlmIChxdWVyeXN0cmluZyAhPT0gXCJcIikge1xuXHRcdFx0dmFyIHByZWZpeCA9IHVybC5pbmRleE9mKFwiP1wiKSA8IDAgPyBcIj9cIiA6IFwiJlwiXG5cdFx0XHR1cmwgKz0gcHJlZml4ICsgcXVlcnlzdHJpbmdcblx0XHR9XG5cdFx0cmV0dXJuIHVybFxuXHR9XG5cdGZ1bmN0aW9uIGRlc2VyaWFsaXplKGRhdGEpIHtcblx0XHR0cnkge3JldHVybiBkYXRhICE9PSBcIlwiID8gSlNPTi5wYXJzZShkYXRhKSA6IG51bGx9XG5cdFx0Y2F0Y2ggKGUpIHt0aHJvdyBuZXcgRXJyb3IoZGF0YSl9XG5cdH1cblx0ZnVuY3Rpb24gZXh0cmFjdCh4aHIpIHtyZXR1cm4geGhyLnJlc3BvbnNlVGV4dH1cblx0ZnVuY3Rpb24gY2FzdCh0eXBlMCwgZGF0YSkge1xuXHRcdGlmICh0eXBlb2YgdHlwZTAgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0ZGF0YVtpXSA9IG5ldyB0eXBlMChkYXRhW2ldKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHJldHVybiBuZXcgdHlwZTAoZGF0YSlcblx0XHR9XG5cdFx0cmV0dXJuIGRhdGFcblx0fVxuXHRyZXR1cm4ge3JlcXVlc3Q6IHJlcXVlc3QsIGpzb25wOiBqc29ucCwgc2V0Q29tcGxldGlvbkNhbGxiYWNrOiBzZXRDb21wbGV0aW9uQ2FsbGJhY2t9XG59XG52YXIgcmVxdWVzdFNlcnZpY2UgPSBfOCh3aW5kb3csIFByb21pc2VQb2x5ZmlsbClcbnZhciBjb3JlUmVuZGVyZXIgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciAkZG9jID0gJHdpbmRvdy5kb2N1bWVudFxuXHR2YXIgJGVtcHR5RnJhZ21lbnQgPSAkZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHR2YXIgbmFtZVNwYWNlID0ge1xuXHRcdHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuXHRcdG1hdGg6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTFwiXG5cdH1cblx0dmFyIG9uZXZlbnRcblx0ZnVuY3Rpb24gc2V0RXZlbnRDYWxsYmFjayhjYWxsYmFjaykge3JldHVybiBvbmV2ZW50ID0gY2FsbGJhY2t9XG5cdGZ1bmN0aW9uIGdldE5hbWVTcGFjZSh2bm9kZSkge1xuXHRcdHJldHVybiB2bm9kZS5hdHRycyAmJiB2bm9kZS5hdHRycy54bWxucyB8fCBuYW1lU3BhY2Vbdm5vZGUudGFnXVxuXHR9XG5cdC8vY3JlYXRlXG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgZW5kLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKSB7XG5cdFx0Zm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdHZhciB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0Y3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpIHtcblx0XHR2YXIgdGFnID0gdm5vZGUudGFnXG5cdFx0aWYgKHR5cGVvZiB0YWcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHZub2RlLnN0YXRlID0ge31cblx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSBpbml0TGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MpXG5cdFx0XHRzd2l0Y2ggKHRhZykge1xuXHRcdFx0XHRjYXNlIFwiI1wiOiByZXR1cm4gY3JlYXRlVGV4dChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZylcblx0XHRcdFx0Y2FzZSBcIjxcIjogcmV0dXJuIGNyZWF0ZUhUTUwocGFyZW50LCB2bm9kZSwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdGNhc2UgXCJbXCI6IHJldHVybiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRkZWZhdWx0OiByZXR1cm4gY3JlYXRlRWxlbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHJldHVybiBjcmVhdGVDb21wb25lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVUZXh0KHBhcmVudCwgdm5vZGUsIG5leHRTaWJsaW5nKSB7XG5cdFx0dm5vZGUuZG9tID0gJGRvYy5jcmVhdGVUZXh0Tm9kZSh2bm9kZS5jaGlsZHJlbilcblx0XHRpbnNlcnROb2RlKHBhcmVudCwgdm5vZGUuZG9tLCBuZXh0U2libGluZylcblx0XHRyZXR1cm4gdm5vZGUuZG9tXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZykge1xuXHRcdHZhciBtYXRjaDEgPSB2bm9kZS5jaGlsZHJlbi5tYXRjaCgvXlxccyo/PChcXHcrKS9pbSkgfHwgW11cblx0XHR2YXIgcGFyZW50MSA9IHtjYXB0aW9uOiBcInRhYmxlXCIsIHRoZWFkOiBcInRhYmxlXCIsIHRib2R5OiBcInRhYmxlXCIsIHRmb290OiBcInRhYmxlXCIsIHRyOiBcInRib2R5XCIsIHRoOiBcInRyXCIsIHRkOiBcInRyXCIsIGNvbGdyb3VwOiBcInRhYmxlXCIsIGNvbDogXCJjb2xncm91cFwifVttYXRjaDFbMV1dIHx8IFwiZGl2XCJcblx0XHR2YXIgdGVtcCA9ICRkb2MuY3JlYXRlRWxlbWVudChwYXJlbnQxKVxuXHRcdHRlbXAuaW5uZXJIVE1MID0gdm5vZGUuY2hpbGRyZW5cblx0XHR2bm9kZS5kb20gPSB0ZW1wLmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gdGVtcC5jaGlsZE5vZGVzLmxlbmd0aFxuXHRcdHZhciBmcmFnbWVudCA9ICRkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0dmFyIGNoaWxkXG5cdFx0d2hpbGUgKGNoaWxkID0gdGVtcC5maXJzdENoaWxkKSB7XG5cdFx0XHRmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZClcblx0XHR9XG5cdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIGZyYWdtZW50LCBuZXh0U2libGluZylcblx0XHRyZXR1cm4gZnJhZ21lbnRcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKSB7XG5cdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRpZiAodm5vZGUuY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0dmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdGNyZWF0ZU5vZGVzKGZyYWdtZW50LCBjaGlsZHJlbiwgMCwgY2hpbGRyZW4ubGVuZ3RoLCBob29rcywgbnVsbCwgbnMpXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IGZyYWdtZW50LmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGhcblx0XHRpbnNlcnROb2RlKHBhcmVudCwgZnJhZ21lbnQsIG5leHRTaWJsaW5nKVxuXHRcdHJldHVybiBmcmFnbWVudFxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZykge1xuXHRcdHZhciB0YWcgPSB2bm9kZS50YWdcblx0XHR2YXIgYXR0cnMyID0gdm5vZGUuYXR0cnNcblx0XHR2YXIgaXMgPSBhdHRyczIgJiYgYXR0cnMyLmlzXG5cdFx0bnMgPSBnZXROYW1lU3BhY2Uodm5vZGUpIHx8IG5zXG5cdFx0dmFyIGVsZW1lbnQgPSBucyA/XG5cdFx0XHRpcyA/ICRkb2MuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcsIHtpczogaXN9KSA6ICRkb2MuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcpIDpcblx0XHRcdGlzID8gJGRvYy5jcmVhdGVFbGVtZW50KHRhZywge2lzOiBpc30pIDogJGRvYy5jcmVhdGVFbGVtZW50KHRhZylcblx0XHR2bm9kZS5kb20gPSBlbGVtZW50XG5cdFx0aWYgKGF0dHJzMiAhPSBudWxsKSB7XG5cdFx0XHRzZXRBdHRycyh2bm9kZSwgYXR0cnMyLCBucylcblx0XHR9XG5cdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIGVsZW1lbnQsIG5leHRTaWJsaW5nKVxuXHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsICYmIHZub2RlLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSAhPSBudWxsKSB7XG5cdFx0XHRzZXRDb250ZW50RWRpdGFibGUodm5vZGUpXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKHZub2RlLnRleHQgIT0gbnVsbCkge1xuXHRcdFx0XHRpZiAodm5vZGUudGV4dCAhPT0gXCJcIikgZWxlbWVudC50ZXh0Q29udGVudCA9IHZub2RlLnRleHRcblx0XHRcdFx0ZWxzZSB2bm9kZS5jaGlsZHJlbiA9IFtWbm9kZShcIiNcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHZub2RlLnRleHQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKV1cblx0XHRcdH1cblx0XHRcdGlmICh2bm9kZS5jaGlsZHJlbiAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0XHRcdGNyZWF0ZU5vZGVzKGVsZW1lbnQsIGNoaWxkcmVuLCAwLCBjaGlsZHJlbi5sZW5ndGgsIGhvb2tzLCBudWxsLCBucylcblx0XHRcdFx0c2V0TGF0ZUF0dHJzKHZub2RlKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZWxlbWVudFxuXHR9XG5cdGZ1bmN0aW9uIGluaXRDb21wb25lbnQodm5vZGUsIGhvb2tzKSB7XG5cdFx0dmFyIHNlbnRpbmVsXG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcudmlldyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IE9iamVjdC5jcmVhdGUodm5vZGUudGFnKVxuXHRcdFx0c2VudGluZWwgPSB2bm9kZS5zdGF0ZS52aWV3XG5cdFx0XHRpZiAoc2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgIT0gbnVsbCkgcmV0dXJuICRlbXB0eUZyYWdtZW50XG5cdFx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IHRydWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0dm5vZGUuc3RhdGUgPSB2b2lkIDBcblx0XHRcdHNlbnRpbmVsID0gdm5vZGUudGFnXG5cdFx0XHRpZiAoc2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgIT0gbnVsbCkgcmV0dXJuICRlbXB0eUZyYWdtZW50XG5cdFx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IHRydWVcblx0XHRcdHZub2RlLnN0YXRlID0gKHZub2RlLnRhZy5wcm90b3R5cGUgIT0gbnVsbCAmJiB0eXBlb2Ygdm5vZGUudGFnLnByb3RvdHlwZS52aWV3ID09PSBcImZ1bmN0aW9uXCIpID8gbmV3IHZub2RlLnRhZyh2bm9kZSkgOiB2bm9kZS50YWcodm5vZGUpXG5cdFx0fVxuXHRcdHZub2RlLl9zdGF0ZSA9IHZub2RlLnN0YXRlXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwpIGluaXRMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcylcblx0XHRpbml0TGlmZWN5Y2xlKHZub2RlLl9zdGF0ZSwgdm5vZGUsIGhvb2tzKVxuXHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKHZub2RlLl9zdGF0ZS52aWV3LmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKSlcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgPT09IHZub2RlKSB0aHJvdyBFcnJvcihcIkEgdmlldyBjYW5ub3QgcmV0dXJuIHRoZSB2bm9kZSBpdCByZWNlaXZlZCBhcyBhcmd1bWVudFwiKVxuXHRcdHNlbnRpbmVsLiQkcmVlbnRyYW50TG9jayQkID0gbnVsbFxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKSB7XG5cdFx0aW5pdENvbXBvbmVudCh2bm9kZSwgaG9va3MpXG5cdFx0aWYgKHZub2RlLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdHZhciBlbGVtZW50ID0gY3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLmluc3RhbmNlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0dm5vZGUuZG9tID0gdm5vZGUuaW5zdGFuY2UuZG9tXG5cdFx0XHR2bm9kZS5kb21TaXplID0gdm5vZGUuZG9tICE9IG51bGwgPyB2bm9kZS5pbnN0YW5jZS5kb21TaXplIDogMFxuXHRcdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIGVsZW1lbnQsIG5leHRTaWJsaW5nKVxuXHRcdFx0cmV0dXJuIGVsZW1lbnRcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR2bm9kZS5kb21TaXplID0gMFxuXHRcdFx0cmV0dXJuICRlbXB0eUZyYWdtZW50XG5cdFx0fVxuXHR9XG5cdC8vdXBkYXRlXG5cdGZ1bmN0aW9uIHVwZGF0ZU5vZGVzKHBhcmVudCwgb2xkLCB2bm9kZXMsIHJlY3ljbGluZywgaG9va3MsIG5leHRTaWJsaW5nLCBucykge1xuXHRcdGlmIChvbGQgPT09IHZub2RlcyB8fCBvbGQgPT0gbnVsbCAmJiB2bm9kZXMgPT0gbnVsbCkgcmV0dXJuXG5cdFx0ZWxzZSBpZiAob2xkID09IG51bGwpIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCAwLCB2bm9kZXMubGVuZ3RoLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKVxuXHRcdGVsc2UgaWYgKHZub2RlcyA9PSBudWxsKSByZW1vdmVOb2RlcyhvbGQsIDAsIG9sZC5sZW5ndGgsIHZub2Rlcylcblx0XHRlbHNlIHtcblx0XHRcdGlmIChvbGQubGVuZ3RoID09PSB2bm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRcdHZhciBpc1Vua2V5ZWQgPSBmYWxzZVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHZub2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmICh2bm9kZXNbaV0gIT0gbnVsbCAmJiBvbGRbaV0gIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0aXNVbmtleWVkID0gdm5vZGVzW2ldLmtleSA9PSBudWxsICYmIG9sZFtpXS5rZXkgPT0gbnVsbFxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGlzVW5rZXllZCkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb2xkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAob2xkW2ldID09PSB2bm9kZXNbaV0pIGNvbnRpbnVlXG5cdFx0XHRcdFx0XHRlbHNlIGlmIChvbGRbaV0gPT0gbnVsbCAmJiB2bm9kZXNbaV0gIT0gbnVsbCkgY3JlYXRlTm9kZShwYXJlbnQsIHZub2Rlc1tpXSwgaG9va3MsIG5zLCBnZXROZXh0U2libGluZyhvbGQsIGkgKyAxLCBuZXh0U2libGluZykpXG5cdFx0XHRcdFx0XHRlbHNlIGlmICh2bm9kZXNbaV0gPT0gbnVsbCkgcmVtb3ZlTm9kZXMob2xkLCBpLCBpICsgMSwgdm5vZGVzKVxuXHRcdFx0XHRcdFx0ZWxzZSB1cGRhdGVOb2RlKHBhcmVudCwgb2xkW2ldLCB2bm9kZXNbaV0sIGhvb2tzLCBnZXROZXh0U2libGluZyhvbGQsIGkgKyAxLCBuZXh0U2libGluZyksIHJlY3ljbGluZywgbnMpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZWN5Y2xpbmcgPSByZWN5Y2xpbmcgfHwgaXNSZWN5Y2xhYmxlKG9sZCwgdm5vZGVzKVxuXHRcdFx0aWYgKHJlY3ljbGluZykge1xuXHRcdFx0XHR2YXIgcG9vbCA9IG9sZC5wb29sXG5cdFx0XHRcdG9sZCA9IG9sZC5jb25jYXQob2xkLnBvb2wpXG5cdFx0XHR9XG5cdFx0XHR2YXIgb2xkU3RhcnQgPSAwLCBzdGFydCA9IDAsIG9sZEVuZCA9IG9sZC5sZW5ndGggLSAxLCBlbmQgPSB2bm9kZXMubGVuZ3RoIC0gMSwgbWFwXG5cdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHR2YXIgbyA9IG9sZFtvbGRTdGFydF0sIHYgPSB2bm9kZXNbc3RhcnRdXG5cdFx0XHRcdGlmIChvID09PSB2ICYmICFyZWN5Y2xpbmcpIG9sZFN0YXJ0KyssIHN0YXJ0Kytcblx0XHRcdFx0ZWxzZSBpZiAobyA9PSBudWxsKSBvbGRTdGFydCsrXG5cdFx0XHRcdGVsc2UgaWYgKHYgPT0gbnVsbCkgc3RhcnQrK1xuXHRcdFx0XHRlbHNlIGlmIChvLmtleSA9PT0gdi5rZXkpIHtcblx0XHRcdFx0XHR2YXIgc2hvdWxkUmVjeWNsZSA9IChwb29sICE9IG51bGwgJiYgb2xkU3RhcnQgPj0gb2xkLmxlbmd0aCAtIHBvb2wubGVuZ3RoKSB8fCAoKHBvb2wgPT0gbnVsbCkgJiYgcmVjeWNsaW5nKVxuXHRcdFx0XHRcdG9sZFN0YXJ0KyssIHN0YXJ0Kytcblx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG5leHRTaWJsaW5nKSwgc2hvdWxkUmVjeWNsZSwgbnMpXG5cdFx0XHRcdFx0aWYgKHJlY3ljbGluZyAmJiBvLnRhZyA9PT0gdi50YWcpIGluc2VydE5vZGUocGFyZW50LCB0b0ZyYWdtZW50KG8pLCBuZXh0U2libGluZylcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR2YXIgbyA9IG9sZFtvbGRFbmRdXG5cdFx0XHRcdFx0aWYgKG8gPT09IHYgJiYgIXJlY3ljbGluZykgb2xkRW5kLS0sIHN0YXJ0Kytcblx0XHRcdFx0XHRlbHNlIGlmIChvID09IG51bGwpIG9sZEVuZC0tXG5cdFx0XHRcdFx0ZWxzZSBpZiAodiA9PSBudWxsKSBzdGFydCsrXG5cdFx0XHRcdFx0ZWxzZSBpZiAoby5rZXkgPT09IHYua2V5KSB7XG5cdFx0XHRcdFx0XHR2YXIgc2hvdWxkUmVjeWNsZSA9IChwb29sICE9IG51bGwgJiYgb2xkRW5kID49IG9sZC5sZW5ndGggLSBwb29sLmxlbmd0aCkgfHwgKChwb29sID09IG51bGwpICYmIHJlY3ljbGluZylcblx0XHRcdFx0XHRcdHVwZGF0ZU5vZGUocGFyZW50LCBvLCB2LCBob29rcywgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRFbmQgKyAxLCBuZXh0U2libGluZyksIHNob3VsZFJlY3ljbGUsIG5zKVxuXHRcdFx0XHRcdFx0aWYgKHJlY3ljbGluZyB8fCBzdGFydCA8IGVuZCkgaW5zZXJ0Tm9kZShwYXJlbnQsIHRvRnJhZ21lbnQobyksIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG5leHRTaWJsaW5nKSlcblx0XHRcdFx0XHRcdG9sZEVuZC0tLCBzdGFydCsrXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgYnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKG9sZEVuZCA+PSBvbGRTdGFydCAmJiBlbmQgPj0gc3RhcnQpIHtcblx0XHRcdFx0dmFyIG8gPSBvbGRbb2xkRW5kXSwgdiA9IHZub2Rlc1tlbmRdXG5cdFx0XHRcdGlmIChvID09PSB2ICYmICFyZWN5Y2xpbmcpIG9sZEVuZC0tLCBlbmQtLVxuXHRcdFx0XHRlbHNlIGlmIChvID09IG51bGwpIG9sZEVuZC0tXG5cdFx0XHRcdGVsc2UgaWYgKHYgPT0gbnVsbCkgZW5kLS1cblx0XHRcdFx0ZWxzZSBpZiAoby5rZXkgPT09IHYua2V5KSB7XG5cdFx0XHRcdFx0dmFyIHNob3VsZFJlY3ljbGUgPSAocG9vbCAhPSBudWxsICYmIG9sZEVuZCA+PSBvbGQubGVuZ3RoIC0gcG9vbC5sZW5ndGgpIHx8ICgocG9vbCA9PSBudWxsKSAmJiByZWN5Y2xpbmcpXG5cdFx0XHRcdFx0dXBkYXRlTm9kZShwYXJlbnQsIG8sIHYsIGhvb2tzLCBnZXROZXh0U2libGluZyhvbGQsIG9sZEVuZCArIDEsIG5leHRTaWJsaW5nKSwgc2hvdWxkUmVjeWNsZSwgbnMpXG5cdFx0XHRcdFx0aWYgKHJlY3ljbGluZyAmJiBvLnRhZyA9PT0gdi50YWcpIGluc2VydE5vZGUocGFyZW50LCB0b0ZyYWdtZW50KG8pLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRpZiAoby5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSBvLmRvbVxuXHRcdFx0XHRcdG9sZEVuZC0tLCBlbmQtLVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGlmICghbWFwKSBtYXAgPSBnZXRLZXlNYXAob2xkLCBvbGRFbmQpXG5cdFx0XHRcdFx0aWYgKHYgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0dmFyIG9sZEluZGV4ID0gbWFwW3Yua2V5XVxuXHRcdFx0XHRcdFx0aWYgKG9sZEluZGV4ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0dmFyIG1vdmFibGUgPSBvbGRbb2xkSW5kZXhdXG5cdFx0XHRcdFx0XHRcdHZhciBzaG91bGRSZWN5Y2xlID0gKHBvb2wgIT0gbnVsbCAmJiBvbGRJbmRleCA+PSBvbGQubGVuZ3RoIC0gcG9vbC5sZW5ndGgpIHx8ICgocG9vbCA9PSBudWxsKSAmJiByZWN5Y2xpbmcpXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZU5vZGUocGFyZW50LCBtb3ZhYmxlLCB2LCBob29rcywgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRFbmQgKyAxLCBuZXh0U2libGluZyksIHJlY3ljbGluZywgbnMpXG5cdFx0XHRcdFx0XHRcdGluc2VydE5vZGUocGFyZW50LCB0b0ZyYWdtZW50KG1vdmFibGUpLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRcdFx0b2xkW29sZEluZGV4XS5za2lwID0gdHJ1ZVxuXHRcdFx0XHRcdFx0XHRpZiAobW92YWJsZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSBtb3ZhYmxlLmRvbVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHZhciBkb20gPSBjcmVhdGVOb2RlKHBhcmVudCwgdiwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRcdFx0bmV4dFNpYmxpbmcgPSBkb21cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZW5kLS1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZW5kIDwgc3RhcnQpIGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjcmVhdGVOb2RlcyhwYXJlbnQsIHZub2Rlcywgc3RhcnQsIGVuZCArIDEsIGhvb2tzLCBuZXh0U2libGluZywgbnMpXG5cdFx0XHRyZW1vdmVOb2RlcyhvbGQsIG9sZFN0YXJ0LCBvbGRFbmQgKyAxLCB2bm9kZXMpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZU5vZGUocGFyZW50LCBvbGQsIHZub2RlLCBob29rcywgbmV4dFNpYmxpbmcsIHJlY3ljbGluZywgbnMpIHtcblx0XHR2YXIgb2xkVGFnID0gb2xkLnRhZywgdGFnID0gdm5vZGUudGFnXG5cdFx0aWYgKG9sZFRhZyA9PT0gdGFnKSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IG9sZC5zdGF0ZVxuXHRcdFx0dm5vZGUuX3N0YXRlID0gb2xkLl9zdGF0ZVxuXHRcdFx0dm5vZGUuZXZlbnRzID0gb2xkLmV2ZW50c1xuXHRcdFx0aWYgKCFyZWN5Y2xpbmcgJiYgc2hvdWxkTm90VXBkYXRlKHZub2RlLCBvbGQpKSByZXR1cm5cblx0XHRcdGlmICh0eXBlb2Ygb2xkVGFnID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKHJlY3ljbGluZykge1xuXHRcdFx0XHRcdFx0dm5vZGUuc3RhdGUgPSB7fVxuXHRcdFx0XHRcdFx0aW5pdExpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHN3aXRjaCAob2xkVGFnKSB7XG5cdFx0XHRcdFx0Y2FzZSBcIiNcIjogdXBkYXRlVGV4dChvbGQsIHZub2RlKTsgYnJlYWtcblx0XHRcdFx0XHRjYXNlIFwiPFwiOiB1cGRhdGVIVE1MKHBhcmVudCwgb2xkLCB2bm9kZSwgbmV4dFNpYmxpbmcpOyBicmVha1xuXHRcdFx0XHRcdGNhc2UgXCJbXCI6IHVwZGF0ZUZyYWdtZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgcmVjeWNsaW5nLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKTsgYnJlYWtcblx0XHRcdFx0XHRkZWZhdWx0OiB1cGRhdGVFbGVtZW50KG9sZCwgdm5vZGUsIHJlY3ljbGluZywgaG9va3MsIG5zKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHVwZGF0ZUNvbXBvbmVudChwYXJlbnQsIG9sZCwgdm5vZGUsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucylcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZW1vdmVOb2RlKG9sZCwgbnVsbClcblx0XHRcdGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlVGV4dChvbGQsIHZub2RlKSB7XG5cdFx0aWYgKG9sZC5jaGlsZHJlbi50b1N0cmluZygpICE9PSB2bm9kZS5jaGlsZHJlbi50b1N0cmluZygpKSB7XG5cdFx0XHRvbGQuZG9tLm5vZGVWYWx1ZSA9IHZub2RlLmNoaWxkcmVuXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVIVE1MKHBhcmVudCwgb2xkLCB2bm9kZSwgbmV4dFNpYmxpbmcpIHtcblx0XHRpZiAob2xkLmNoaWxkcmVuICE9PSB2bm9kZS5jaGlsZHJlbikge1xuXHRcdFx0dG9GcmFnbWVudChvbGQpXG5cdFx0XHRjcmVhdGVIVE1MKHBhcmVudCwgdm5vZGUsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0XHRlbHNlIHZub2RlLmRvbSA9IG9sZC5kb20sIHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUZyYWdtZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgcmVjeWNsaW5nLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKSB7XG5cdFx0dXBkYXRlTm9kZXMocGFyZW50LCBvbGQuY2hpbGRyZW4sIHZub2RlLmNoaWxkcmVuLCByZWN5Y2xpbmcsIGhvb2tzLCBuZXh0U2libGluZywgbnMpXG5cdFx0dmFyIGRvbVNpemUgPSAwLCBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0dm5vZGUuZG9tID0gbnVsbFxuXHRcdGlmIChjaGlsZHJlbiAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsICYmIGNoaWxkLmRvbSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKHZub2RlLmRvbSA9PSBudWxsKSB2bm9kZS5kb20gPSBjaGlsZC5kb21cblx0XHRcdFx0XHRkb21TaXplICs9IGNoaWxkLmRvbVNpemUgfHwgMVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoZG9tU2l6ZSAhPT0gMSkgdm5vZGUuZG9tU2l6ZSA9IGRvbVNpemVcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlRWxlbWVudChvbGQsIHZub2RlLCByZWN5Y2xpbmcsIGhvb2tzLCBucykge1xuXHRcdHZhciBlbGVtZW50ID0gdm5vZGUuZG9tID0gb2xkLmRvbVxuXHRcdG5zID0gZ2V0TmFtZVNwYWNlKHZub2RlKSB8fCBuc1xuXHRcdGlmICh2bm9kZS50YWcgPT09IFwidGV4dGFyZWFcIikge1xuXHRcdFx0aWYgKHZub2RlLmF0dHJzID09IG51bGwpIHZub2RlLmF0dHJzID0ge31cblx0XHRcdGlmICh2bm9kZS50ZXh0ICE9IG51bGwpIHtcblx0XHRcdFx0dm5vZGUuYXR0cnMudmFsdWUgPSB2bm9kZS50ZXh0IC8vRklYTUUgaGFuZGxlMCBtdWx0aXBsZSBjaGlsZHJlblxuXHRcdFx0XHR2bm9kZS50ZXh0ID0gdW5kZWZpbmVkXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHVwZGF0ZUF0dHJzKHZub2RlLCBvbGQuYXR0cnMsIHZub2RlLmF0dHJzLCBucylcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCAmJiB2bm9kZS5hdHRycy5jb250ZW50ZWRpdGFibGUgIT0gbnVsbCkge1xuXHRcdFx0c2V0Q29udGVudEVkaXRhYmxlKHZub2RlKVxuXHRcdH1cblx0XHRlbHNlIGlmIChvbGQudGV4dCAhPSBudWxsICYmIHZub2RlLnRleHQgIT0gbnVsbCAmJiB2bm9kZS50ZXh0ICE9PSBcIlwiKSB7XG5cdFx0XHRpZiAob2xkLnRleHQudG9TdHJpbmcoKSAhPT0gdm5vZGUudGV4dC50b1N0cmluZygpKSBvbGQuZG9tLmZpcnN0Q2hpbGQubm9kZVZhbHVlID0gdm5vZGUudGV4dFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlmIChvbGQudGV4dCAhPSBudWxsKSBvbGQuY2hpbGRyZW4gPSBbVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvbGQudGV4dCwgdW5kZWZpbmVkLCBvbGQuZG9tLmZpcnN0Q2hpbGQpXVxuXHRcdFx0aWYgKHZub2RlLnRleHQgIT0gbnVsbCkgdm5vZGUuY2hpbGRyZW4gPSBbVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB2bm9kZS50ZXh0LCB1bmRlZmluZWQsIHVuZGVmaW5lZCldXG5cdFx0XHR1cGRhdGVOb2RlcyhlbGVtZW50LCBvbGQuY2hpbGRyZW4sIHZub2RlLmNoaWxkcmVuLCByZWN5Y2xpbmcsIGhvb2tzLCBudWxsLCBucylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlQ29tcG9uZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgaG9va3MsIG5leHRTaWJsaW5nLCByZWN5Y2xpbmcsIG5zKSB7XG5cdFx0aWYgKHJlY3ljbGluZykge1xuXHRcdFx0aW5pdENvbXBvbmVudCh2bm9kZSwgaG9va3MpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKHZub2RlLl9zdGF0ZS52aWV3LmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKSlcblx0XHRcdGlmICh2bm9kZS5pbnN0YW5jZSA9PT0gdm5vZGUpIHRocm93IEVycm9yKFwiQSB2aWV3IGNhbm5vdCByZXR1cm4gdGhlIHZub2RlIGl0IHJlY2VpdmVkIGFzIGFyZ3VtZW50XCIpXG5cdFx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCkgdXBkYXRlTGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MpXG5cdFx0XHR1cGRhdGVMaWZlY3ljbGUodm5vZGUuX3N0YXRlLCB2bm9kZSwgaG9va3MpXG5cdFx0fVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAob2xkLmluc3RhbmNlID09IG51bGwpIGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5zLCBuZXh0U2libGluZylcblx0XHRcdGVsc2UgdXBkYXRlTm9kZShwYXJlbnQsIG9sZC5pbnN0YW5jZSwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucylcblx0XHRcdHZub2RlLmRvbSA9IHZub2RlLmluc3RhbmNlLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IHZub2RlLmluc3RhbmNlLmRvbVNpemVcblx0XHR9XG5cdFx0ZWxzZSBpZiAob2xkLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdHJlbW92ZU5vZGUob2xkLmluc3RhbmNlLCBudWxsKVxuXHRcdFx0dm5vZGUuZG9tID0gdW5kZWZpbmVkXG5cdFx0XHR2bm9kZS5kb21TaXplID0gMFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBpc1JlY3ljbGFibGUob2xkLCB2bm9kZXMpIHtcblx0XHRpZiAob2xkLnBvb2wgIT0gbnVsbCAmJiBNYXRoLmFicyhvbGQucG9vbC5sZW5ndGggLSB2bm9kZXMubGVuZ3RoKSA8PSBNYXRoLmFicyhvbGQubGVuZ3RoIC0gdm5vZGVzLmxlbmd0aCkpIHtcblx0XHRcdHZhciBvbGRDaGlsZHJlbkxlbmd0aCA9IG9sZFswXSAmJiBvbGRbMF0uY2hpbGRyZW4gJiYgb2xkWzBdLmNoaWxkcmVuLmxlbmd0aCB8fCAwXG5cdFx0XHR2YXIgcG9vbENoaWxkcmVuTGVuZ3RoID0gb2xkLnBvb2xbMF0gJiYgb2xkLnBvb2xbMF0uY2hpbGRyZW4gJiYgb2xkLnBvb2xbMF0uY2hpbGRyZW4ubGVuZ3RoIHx8IDBcblx0XHRcdHZhciB2bm9kZXNDaGlsZHJlbkxlbmd0aCA9IHZub2Rlc1swXSAmJiB2bm9kZXNbMF0uY2hpbGRyZW4gJiYgdm5vZGVzWzBdLmNoaWxkcmVuLmxlbmd0aCB8fCAwXG5cdFx0XHRpZiAoTWF0aC5hYnMocG9vbENoaWxkcmVuTGVuZ3RoIC0gdm5vZGVzQ2hpbGRyZW5MZW5ndGgpIDw9IE1hdGguYWJzKG9sZENoaWxkcmVuTGVuZ3RoIC0gdm5vZGVzQ2hpbGRyZW5MZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cdGZ1bmN0aW9uIGdldEtleU1hcCh2bm9kZXMsIGVuZCkge1xuXHRcdHZhciBtYXAgPSB7fSwgaSA9IDBcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHR2YXIgdm5vZGUgPSB2bm9kZXNbaV1cblx0XHRcdGlmICh2bm9kZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBrZXkyID0gdm5vZGUua2V5XG5cdFx0XHRcdGlmIChrZXkyICE9IG51bGwpIG1hcFtrZXkyXSA9IGlcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1hcFxuXHR9XG5cdGZ1bmN0aW9uIHRvRnJhZ21lbnQodm5vZGUpIHtcblx0XHR2YXIgY291bnQwID0gdm5vZGUuZG9tU2l6ZVxuXHRcdGlmIChjb3VudDAgIT0gbnVsbCB8fCB2bm9kZS5kb20gPT0gbnVsbCkge1xuXHRcdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRcdGlmIChjb3VudDAgPiAwKSB7XG5cdFx0XHRcdHZhciBkb20gPSB2bm9kZS5kb21cblx0XHRcdFx0d2hpbGUgKC0tY291bnQwKSBmcmFnbWVudC5hcHBlbmRDaGlsZChkb20ubmV4dFNpYmxpbmcpXG5cdFx0XHRcdGZyYWdtZW50Lmluc2VydEJlZm9yZShkb20sIGZyYWdtZW50LmZpcnN0Q2hpbGQpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZnJhZ21lbnRcblx0XHR9XG5cdFx0ZWxzZSByZXR1cm4gdm5vZGUuZG9tXG5cdH1cblx0ZnVuY3Rpb24gZ2V0TmV4dFNpYmxpbmcodm5vZGVzLCBpLCBuZXh0U2libGluZykge1xuXHRcdGZvciAoOyBpIDwgdm5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAodm5vZGVzW2ldICE9IG51bGwgJiYgdm5vZGVzW2ldLmRvbSAhPSBudWxsKSByZXR1cm4gdm5vZGVzW2ldLmRvbVxuXHRcdH1cblx0XHRyZXR1cm4gbmV4dFNpYmxpbmdcblx0fVxuXHRmdW5jdGlvbiBpbnNlcnROb2RlKHBhcmVudCwgZG9tLCBuZXh0U2libGluZykge1xuXHRcdGlmIChuZXh0U2libGluZyAmJiBuZXh0U2libGluZy5wYXJlbnROb2RlKSBwYXJlbnQuaW5zZXJ0QmVmb3JlKGRvbSwgbmV4dFNpYmxpbmcpXG5cdFx0ZWxzZSBwYXJlbnQuYXBwZW5kQ2hpbGQoZG9tKVxuXHR9XG5cdGZ1bmN0aW9uIHNldENvbnRlbnRFZGl0YWJsZSh2bm9kZSkge1xuXHRcdHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0aWYgKGNoaWxkcmVuICE9IG51bGwgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIGNoaWxkcmVuWzBdLnRhZyA9PT0gXCI8XCIpIHtcblx0XHRcdHZhciBjb250ZW50ID0gY2hpbGRyZW5bMF0uY2hpbGRyZW5cblx0XHRcdGlmICh2bm9kZS5kb20uaW5uZXJIVE1MICE9PSBjb250ZW50KSB2bm9kZS5kb20uaW5uZXJIVE1MID0gY29udGVudFxuXHRcdH1cblx0XHRlbHNlIGlmICh2bm9kZS50ZXh0ICE9IG51bGwgfHwgY2hpbGRyZW4gIT0gbnVsbCAmJiBjaGlsZHJlbi5sZW5ndGggIT09IDApIHRocm93IG5ldyBFcnJvcihcIkNoaWxkIG5vZGUgb2YgYSBjb250ZW50ZWRpdGFibGUgbXVzdCBiZSB0cnVzdGVkXCIpXG5cdH1cblx0Ly9yZW1vdmVcblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZXModm5vZGVzLCBzdGFydCwgZW5kLCBjb250ZXh0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdHZhciB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0aWYgKHZub2RlLnNraXApIHZub2RlLnNraXAgPSBmYWxzZVxuXHRcdFx0XHRlbHNlIHJlbW92ZU5vZGUodm5vZGUsIGNvbnRleHQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZU5vZGUodm5vZGUsIGNvbnRleHQpIHtcblx0XHR2YXIgZXhwZWN0ZWQgPSAxLCBjYWxsZWQgPSAwXG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHR5cGVvZiB2bm9kZS5hdHRycy5vbmJlZm9yZXJlbW92ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdm5vZGUuYXR0cnMub25iZWZvcmVyZW1vdmUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpXG5cdFx0XHRpZiAocmVzdWx0ICE9IG51bGwgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0ZXhwZWN0ZWQrK1xuXHRcdFx0XHRyZXN1bHQudGhlbihjb250aW51YXRpb24sIGNvbnRpbnVhdGlvbilcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHZub2RlLl9zdGF0ZS5vbmJlZm9yZXJlbW92ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdm5vZGUuX3N0YXRlLm9uYmVmb3JlcmVtb3ZlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKVxuXHRcdFx0aWYgKHJlc3VsdCAhPSBudWxsICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdGV4cGVjdGVkKytcblx0XHRcdFx0cmVzdWx0LnRoZW4oY29udGludWF0aW9uLCBjb250aW51YXRpb24pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnRpbnVhdGlvbigpXG5cdFx0ZnVuY3Rpb24gY29udGludWF0aW9uKCkge1xuXHRcdFx0aWYgKCsrY2FsbGVkID09PSBleHBlY3RlZCkge1xuXHRcdFx0XHRvbnJlbW92ZSh2bm9kZSlcblx0XHRcdFx0aWYgKHZub2RlLmRvbSkge1xuXHRcdFx0XHRcdHZhciBjb3VudDAgPSB2bm9kZS5kb21TaXplIHx8IDFcblx0XHRcdFx0XHRpZiAoY291bnQwID4gMSkge1xuXHRcdFx0XHRcdFx0dmFyIGRvbSA9IHZub2RlLmRvbVxuXHRcdFx0XHRcdFx0d2hpbGUgKC0tY291bnQwKSB7XG5cdFx0XHRcdFx0XHRcdHJlbW92ZU5vZGVGcm9tRE9NKGRvbS5uZXh0U2libGluZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVtb3ZlTm9kZUZyb21ET00odm5vZGUuZG9tKVxuXHRcdFx0XHRcdGlmIChjb250ZXh0ICE9IG51bGwgJiYgdm5vZGUuZG9tU2l6ZSA9PSBudWxsICYmICFoYXNJbnRlZ3JhdGlvbk1ldGhvZHModm5vZGUuYXR0cnMpICYmIHR5cGVvZiB2bm9kZS50YWcgPT09IFwic3RyaW5nXCIpIHsgLy9UT0RPIHRlc3QgY3VzdG9tIGVsZW1lbnRzXG5cdFx0XHRcdFx0XHRpZiAoIWNvbnRleHQucG9vbCkgY29udGV4dC5wb29sID0gW3Zub2RlXVxuXHRcdFx0XHRcdFx0ZWxzZSBjb250ZXh0LnBvb2wucHVzaCh2bm9kZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZUZyb21ET00obm9kZSkge1xuXHRcdHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGVcblx0XHRpZiAocGFyZW50ICE9IG51bGwpIHBhcmVudC5yZW1vdmVDaGlsZChub2RlKVxuXHR9XG5cdGZ1bmN0aW9uIG9ucmVtb3ZlKHZub2RlKSB7XG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHR5cGVvZiB2bm9kZS5hdHRycy5vbnJlbW92ZSA9PT0gXCJmdW5jdGlvblwiKSB2bm9kZS5hdHRycy5vbnJlbW92ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gXCJzdHJpbmdcIiAmJiB0eXBlb2Ygdm5vZGUuX3N0YXRlLm9ucmVtb3ZlID09PSBcImZ1bmN0aW9uXCIpIHZub2RlLl9zdGF0ZS5vbnJlbW92ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgIT0gbnVsbCkgb25yZW1vdmUodm5vZGUuaW5zdGFuY2UpXG5cdFx0ZWxzZSB7XG5cdFx0XHR2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsKSBvbnJlbW92ZShjaGlsZClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvL2F0dHJzMlxuXHRmdW5jdGlvbiBzZXRBdHRycyh2bm9kZSwgYXR0cnMyLCBucykge1xuXHRcdGZvciAodmFyIGtleTIgaW4gYXR0cnMyKSB7XG5cdFx0XHRzZXRBdHRyKHZub2RlLCBrZXkyLCBudWxsLCBhdHRyczJba2V5Ml0sIG5zKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzZXRBdHRyKHZub2RlLCBrZXkyLCBvbGQsIHZhbHVlLCBucykge1xuXHRcdHZhciBlbGVtZW50ID0gdm5vZGUuZG9tXG5cdFx0aWYgKGtleTIgPT09IFwia2V5XCIgfHwga2V5MiA9PT0gXCJpc1wiIHx8IChvbGQgPT09IHZhbHVlICYmICFpc0Zvcm1BdHRyaWJ1dGUodm5vZGUsIGtleTIpKSAmJiB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiIHx8IGlzTGlmZWN5Y2xlTWV0aG9kKGtleTIpKSByZXR1cm5cblx0XHR2YXIgbnNMYXN0SW5kZXggPSBrZXkyLmluZGV4T2YoXCI6XCIpXG5cdFx0aWYgKG5zTGFzdEluZGV4ID4gLTEgJiYga2V5Mi5zdWJzdHIoMCwgbnNMYXN0SW5kZXgpID09PSBcInhsaW5rXCIpIHtcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIGtleTIuc2xpY2UobnNMYXN0SW5kZXggKyAxKSwgdmFsdWUpXG5cdFx0fVxuXHRcdGVsc2UgaWYgKGtleTJbMF0gPT09IFwib1wiICYmIGtleTJbMV0gPT09IFwiblwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB1cGRhdGVFdmVudCh2bm9kZSwga2V5MiwgdmFsdWUpXG5cdFx0ZWxzZSBpZiAoa2V5MiA9PT0gXCJzdHlsZVwiKSB1cGRhdGVTdHlsZShlbGVtZW50LCBvbGQsIHZhbHVlKVxuXHRcdGVsc2UgaWYgKGtleTIgaW4gZWxlbWVudCAmJiAhaXNBdHRyaWJ1dGUoa2V5MikgJiYgbnMgPT09IHVuZGVmaW5lZCAmJiAhaXNDdXN0b21FbGVtZW50KHZub2RlKSkge1xuXHRcdFx0aWYgKGtleTIgPT09IFwidmFsdWVcIikge1xuXHRcdFx0XHR2YXIgbm9ybWFsaXplZDAgPSBcIlwiICsgdmFsdWUgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1pbXBsaWNpdC1jb2VyY2lvblxuXHRcdFx0XHQvL3NldHRpbmcgaW5wdXRbdmFsdWVdIHRvIHNhbWUgdmFsdWUgYnkgdHlwaW5nIG9uIGZvY3VzZWQgZWxlbWVudCBtb3ZlcyBjdXJzb3IgdG8gZW5kIGluIENocm9tZVxuXHRcdFx0XHRpZiAoKHZub2RlLnRhZyA9PT0gXCJpbnB1dFwiIHx8IHZub2RlLnRhZyA9PT0gXCJ0ZXh0YXJlYVwiKSAmJiB2bm9kZS5kb20udmFsdWUgPT09IG5vcm1hbGl6ZWQwICYmIHZub2RlLmRvbSA9PT0gJGRvYy5hY3RpdmVFbGVtZW50KSByZXR1cm5cblx0XHRcdFx0Ly9zZXR0aW5nIHNlbGVjdFt2YWx1ZV0gdG8gc2FtZSB2YWx1ZSB3aGlsZSBoYXZpbmcgc2VsZWN0IG9wZW4gYmxpbmtzIHNlbGVjdCBkcm9wZG93biBpbiBDaHJvbWVcblx0XHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJzZWxlY3RcIikge1xuXHRcdFx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0aWYgKHZub2RlLmRvbS5zZWxlY3RlZEluZGV4ID09PSAtMSAmJiB2bm9kZS5kb20gPT09ICRkb2MuYWN0aXZlRWxlbWVudCkgcmV0dXJuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmIChvbGQgIT09IG51bGwgJiYgdm5vZGUuZG9tLnZhbHVlID09PSBub3JtYWxpemVkMCAmJiB2bm9kZS5kb20gPT09ICRkb2MuYWN0aXZlRWxlbWVudCkgcmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vc2V0dGluZyBvcHRpb25bdmFsdWVdIHRvIHNhbWUgdmFsdWUgd2hpbGUgaGF2aW5nIHNlbGVjdCBvcGVuIGJsaW5rcyBzZWxlY3QgZHJvcGRvd24gaW4gQ2hyb21lXG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09IFwib3B0aW9uXCIgJiYgb2xkICE9IG51bGwgJiYgdm5vZGUuZG9tLnZhbHVlID09PSBub3JtYWxpemVkMCkgcmV0dXJuXG5cdFx0XHR9XG5cdFx0XHQvLyBJZiB5b3UgYXNzaWduIGFuIGlucHV0IHR5cGUxIHRoYXQgaXMgbm90IHN1cHBvcnRlZCBieSBJRSAxMSB3aXRoIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvbiwgYW4gZXJyb3IwIHdpbGwgb2NjdXIuXG5cdFx0XHRpZiAodm5vZGUudGFnID09PSBcImlucHV0XCIgJiYga2V5MiA9PT0gXCJ0eXBlXCIpIHtcblx0XHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5MiwgdmFsdWUpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdFx0ZWxlbWVudFtrZXkyXSA9IHZhbHVlXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0aWYgKHZhbHVlKSBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXkyLCBcIlwiKVxuXHRcdFx0XHRlbHNlIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGtleTIpXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleTIgPT09IFwiY2xhc3NOYW1lXCIgPyBcImNsYXNzXCIgOiBrZXkyLCB2YWx1ZSlcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gc2V0TGF0ZUF0dHJzKHZub2RlKSB7XG5cdFx0dmFyIGF0dHJzMiA9IHZub2RlLmF0dHJzXG5cdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJzZWxlY3RcIiAmJiBhdHRyczIgIT0gbnVsbCkge1xuXHRcdFx0aWYgKFwidmFsdWVcIiBpbiBhdHRyczIpIHNldEF0dHIodm5vZGUsIFwidmFsdWVcIiwgbnVsbCwgYXR0cnMyLnZhbHVlLCB1bmRlZmluZWQpXG5cdFx0XHRpZiAoXCJzZWxlY3RlZEluZGV4XCIgaW4gYXR0cnMyKSBzZXRBdHRyKHZub2RlLCBcInNlbGVjdGVkSW5kZXhcIiwgbnVsbCwgYXR0cnMyLnNlbGVjdGVkSW5kZXgsIHVuZGVmaW5lZClcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlQXR0cnModm5vZGUsIG9sZCwgYXR0cnMyLCBucykge1xuXHRcdGlmIChhdHRyczIgIT0gbnVsbCkge1xuXHRcdFx0Zm9yICh2YXIga2V5MiBpbiBhdHRyczIpIHtcblx0XHRcdFx0c2V0QXR0cih2bm9kZSwga2V5Miwgb2xkICYmIG9sZFtrZXkyXSwgYXR0cnMyW2tleTJdLCBucylcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9sZCAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBrZXkyIGluIG9sZCkge1xuXHRcdFx0XHRpZiAoYXR0cnMyID09IG51bGwgfHwgIShrZXkyIGluIGF0dHJzMikpIHtcblx0XHRcdFx0XHRpZiAoa2V5MiA9PT0gXCJjbGFzc05hbWVcIikga2V5MiA9IFwiY2xhc3NcIlxuXHRcdFx0XHRcdGlmIChrZXkyWzBdID09PSBcIm9cIiAmJiBrZXkyWzFdID09PSBcIm5cIiAmJiAhaXNMaWZlY3ljbGVNZXRob2Qoa2V5MikpIHVwZGF0ZUV2ZW50KHZub2RlLCBrZXkyLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0ZWxzZSBpZiAoa2V5MiAhPT0gXCJrZXlcIikgdm5vZGUuZG9tLnJlbW92ZUF0dHJpYnV0ZShrZXkyKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGlzRm9ybUF0dHJpYnV0ZSh2bm9kZSwgYXR0cikge1xuXHRcdHJldHVybiBhdHRyID09PSBcInZhbHVlXCIgfHwgYXR0ciA9PT0gXCJjaGVja2VkXCIgfHwgYXR0ciA9PT0gXCJzZWxlY3RlZEluZGV4XCIgfHwgYXR0ciA9PT0gXCJzZWxlY3RlZFwiICYmIHZub2RlLmRvbSA9PT0gJGRvYy5hY3RpdmVFbGVtZW50XG5cdH1cblx0ZnVuY3Rpb24gaXNMaWZlY3ljbGVNZXRob2QoYXR0cikge1xuXHRcdHJldHVybiBhdHRyID09PSBcIm9uaW5pdFwiIHx8IGF0dHIgPT09IFwib25jcmVhdGVcIiB8fCBhdHRyID09PSBcIm9udXBkYXRlXCIgfHwgYXR0ciA9PT0gXCJvbnJlbW92ZVwiIHx8IGF0dHIgPT09IFwib25iZWZvcmVyZW1vdmVcIiB8fCBhdHRyID09PSBcIm9uYmVmb3JldXBkYXRlXCJcblx0fVxuXHRmdW5jdGlvbiBpc0F0dHJpYnV0ZShhdHRyKSB7XG5cdFx0cmV0dXJuIGF0dHIgPT09IFwiaHJlZlwiIHx8IGF0dHIgPT09IFwibGlzdFwiIHx8IGF0dHIgPT09IFwiZm9ybVwiIHx8IGF0dHIgPT09IFwid2lkdGhcIiB8fCBhdHRyID09PSBcImhlaWdodFwiLy8gfHwgYXR0ciA9PT0gXCJ0eXBlXCJcblx0fVxuXHRmdW5jdGlvbiBpc0N1c3RvbUVsZW1lbnQodm5vZGUpe1xuXHRcdHJldHVybiB2bm9kZS5hdHRycy5pcyB8fCB2bm9kZS50YWcuaW5kZXhPZihcIi1cIikgPiAtMVxuXHR9XG5cdGZ1bmN0aW9uIGhhc0ludGVncmF0aW9uTWV0aG9kcyhzb3VyY2UpIHtcblx0XHRyZXR1cm4gc291cmNlICE9IG51bGwgJiYgKHNvdXJjZS5vbmNyZWF0ZSB8fCBzb3VyY2Uub251cGRhdGUgfHwgc291cmNlLm9uYmVmb3JlcmVtb3ZlIHx8IHNvdXJjZS5vbnJlbW92ZSlcblx0fVxuXHQvL3N0eWxlXG5cdGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKGVsZW1lbnQsIG9sZCwgc3R5bGUpIHtcblx0XHRpZiAob2xkID09PSBzdHlsZSkgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gXCJcIiwgb2xkID0gbnVsbFxuXHRcdGlmIChzdHlsZSA9PSBudWxsKSBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBcIlwiXG5cdFx0ZWxzZSBpZiAodHlwZW9mIHN0eWxlID09PSBcInN0cmluZ1wiKSBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBzdHlsZVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiBvbGQgPT09IFwic3RyaW5nXCIpIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IFwiXCJcblx0XHRcdGZvciAodmFyIGtleTIgaW4gc3R5bGUpIHtcblx0XHRcdFx0ZWxlbWVudC5zdHlsZVtrZXkyXSA9IHN0eWxlW2tleTJdXG5cdFx0XHR9XG5cdFx0XHRpZiAob2xkICE9IG51bGwgJiYgdHlwZW9mIG9sZCAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkyIGluIG9sZCkge1xuXHRcdFx0XHRcdGlmICghKGtleTIgaW4gc3R5bGUpKSBlbGVtZW50LnN0eWxlW2tleTJdID0gXCJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdC8vZXZlbnRcblx0ZnVuY3Rpb24gdXBkYXRlRXZlbnQodm5vZGUsIGtleTIsIHZhbHVlKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSB2bm9kZS5kb21cblx0XHR2YXIgY2FsbGJhY2sgPSB0eXBlb2Ygb25ldmVudCAhPT0gXCJmdW5jdGlvblwiID8gdmFsdWUgOiBmdW5jdGlvbihlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gdmFsdWUuY2FsbChlbGVtZW50LCBlKVxuXHRcdFx0b25ldmVudC5jYWxsKGVsZW1lbnQsIGUpXG5cdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0fVxuXHRcdGlmIChrZXkyIGluIGVsZW1lbnQpIGVsZW1lbnRba2V5Ml0gPSB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGNhbGxiYWNrIDogbnVsbFxuXHRcdGVsc2Uge1xuXHRcdFx0dmFyIGV2ZW50TmFtZSA9IGtleTIuc2xpY2UoMilcblx0XHRcdGlmICh2bm9kZS5ldmVudHMgPT09IHVuZGVmaW5lZCkgdm5vZGUuZXZlbnRzID0ge31cblx0XHRcdGlmICh2bm9kZS5ldmVudHNba2V5Ml0gPT09IGNhbGxiYWNrKSByZXR1cm5cblx0XHRcdGlmICh2bm9kZS5ldmVudHNba2V5Ml0gIT0gbnVsbCkgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdm5vZGUuZXZlbnRzW2tleTJdLCBmYWxzZSlcblx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR2bm9kZS5ldmVudHNba2V5Ml0gPSBjYWxsYmFja1xuXHRcdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB2bm9kZS5ldmVudHNba2V5Ml0sIGZhbHNlKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvL2xpZmVjeWNsZVxuXHRmdW5jdGlvbiBpbml0TGlmZWN5Y2xlKHNvdXJjZSwgdm5vZGUsIGhvb2tzKSB7XG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub25pbml0ID09PSBcImZ1bmN0aW9uXCIpIHNvdXJjZS5vbmluaXQuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpXG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub25jcmVhdGUgPT09IFwiZnVuY3Rpb25cIikgaG9va3MucHVzaChzb3VyY2Uub25jcmVhdGUuYmluZCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUxpZmVjeWNsZShzb3VyY2UsIHZub2RlLCBob29rcykge1xuXHRcdGlmICh0eXBlb2Ygc291cmNlLm9udXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIGhvb2tzLnB1c2goc291cmNlLm9udXBkYXRlLmJpbmQodm5vZGUuc3RhdGUsIHZub2RlKSlcblx0fVxuXHRmdW5jdGlvbiBzaG91bGROb3RVcGRhdGUodm5vZGUsIG9sZCkge1xuXHRcdHZhciBmb3JjZVZub2RlVXBkYXRlLCBmb3JjZUNvbXBvbmVudFVwZGF0ZVxuXHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsICYmIHR5cGVvZiB2bm9kZS5hdHRycy5vbmJlZm9yZXVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSBmb3JjZVZub2RlVXBkYXRlID0gdm5vZGUuYXR0cnMub25iZWZvcmV1cGRhdGUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUsIG9sZClcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gXCJzdHJpbmdcIiAmJiB0eXBlb2Ygdm5vZGUuX3N0YXRlLm9uYmVmb3JldXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIGZvcmNlQ29tcG9uZW50VXBkYXRlID0gdm5vZGUuX3N0YXRlLm9uYmVmb3JldXBkYXRlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlLCBvbGQpXG5cdFx0aWYgKCEoZm9yY2VWbm9kZVVwZGF0ZSA9PT0gdW5kZWZpbmVkICYmIGZvcmNlQ29tcG9uZW50VXBkYXRlID09PSB1bmRlZmluZWQpICYmICFmb3JjZVZub2RlVXBkYXRlICYmICFmb3JjZUNvbXBvbmVudFVwZGF0ZSkge1xuXHRcdFx0dm5vZGUuZG9tID0gb2xkLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IG9sZC5kb21TaXplXG5cdFx0XHR2bm9kZS5pbnN0YW5jZSA9IG9sZC5pbnN0YW5jZVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblx0ZnVuY3Rpb24gcmVuZGVyKGRvbSwgdm5vZGVzKSB7XG5cdFx0aWYgKCFkb20pIHRocm93IG5ldyBFcnJvcihcIkVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgYmVpbmcgcGFzc2VkIHRvIG0ucm91dGUvbS5tb3VudC9tLnJlbmRlciBpcyBub3QgdW5kZWZpbmVkLlwiKVxuXHRcdHZhciBob29rcyA9IFtdXG5cdFx0dmFyIGFjdGl2ZSA9ICRkb2MuYWN0aXZlRWxlbWVudFxuXHRcdHZhciBuYW1lc3BhY2UgPSBkb20ubmFtZXNwYWNlVVJJXG5cdFx0Ly8gRmlyc3QgdGltZTAgcmVuZGVyaW5nIGludG8gYSBub2RlIGNsZWFycyBpdCBvdXRcblx0XHRpZiAoZG9tLnZub2RlcyA9PSBudWxsKSBkb20udGV4dENvbnRlbnQgPSBcIlwiXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZub2RlcykpIHZub2RlcyA9IFt2bm9kZXNdXG5cdFx0dXBkYXRlTm9kZXMoZG9tLCBkb20udm5vZGVzLCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbih2bm9kZXMpLCBmYWxzZSwgaG9va3MsIG51bGwsIG5hbWVzcGFjZSA9PT0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIgPyB1bmRlZmluZWQgOiBuYW1lc3BhY2UpXG5cdFx0ZG9tLnZub2RlcyA9IHZub2Rlc1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaG9va3MubGVuZ3RoOyBpKyspIGhvb2tzW2ldKClcblx0XHQvLyBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGNhbiByZXR1cm4gbnVsbCBpbiBJRSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRG9jdW1lbnQvYWN0aXZlRWxlbWVudFxuXHRcdGlmIChhY3RpdmUgIT0gbnVsbCAmJiAkZG9jLmFjdGl2ZUVsZW1lbnQgIT09IGFjdGl2ZSkgYWN0aXZlLmZvY3VzKClcblx0fVxuXHRyZXR1cm4ge3JlbmRlcjogcmVuZGVyLCBzZXRFdmVudENhbGxiYWNrOiBzZXRFdmVudENhbGxiYWNrfVxufVxuZnVuY3Rpb24gdGhyb3R0bGUoY2FsbGJhY2spIHtcblx0Ly82MGZwcyB0cmFuc2xhdGVzIHRvIDE2LjZtcywgcm91bmQgaXQgZG93biBzaW5jZSBzZXRUaW1lb3V0IHJlcXVpcmVzIGludFxuXHR2YXIgdGltZSA9IDE2XG5cdHZhciBsYXN0ID0gMCwgcGVuZGluZyA9IG51bGxcblx0dmFyIHRpbWVvdXQgPSB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSBcImZ1bmN0aW9uXCIgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgOiBzZXRUaW1lb3V0XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm93ID0gRGF0ZS5ub3coKVxuXHRcdGlmIChsYXN0ID09PSAwIHx8IG5vdyAtIGxhc3QgPj0gdGltZSkge1xuXHRcdFx0bGFzdCA9IG5vd1xuXHRcdFx0Y2FsbGJhY2soKVxuXHRcdH1cblx0XHRlbHNlIGlmIChwZW5kaW5nID09PSBudWxsKSB7XG5cdFx0XHRwZW5kaW5nID0gdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0cGVuZGluZyA9IG51bGxcblx0XHRcdFx0Y2FsbGJhY2soKVxuXHRcdFx0XHRsYXN0ID0gRGF0ZS5ub3coKVxuXHRcdFx0fSwgdGltZSAtIChub3cgLSBsYXN0KSlcblx0XHR9XG5cdH1cbn1cbnZhciBfMTEgPSBmdW5jdGlvbigkd2luZG93KSB7XG5cdHZhciByZW5kZXJTZXJ2aWNlID0gY29yZVJlbmRlcmVyKCR3aW5kb3cpXG5cdHJlbmRlclNlcnZpY2Uuc2V0RXZlbnRDYWxsYmFjayhmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucmVkcmF3ID09PSBmYWxzZSkgZS5yZWRyYXcgPSB1bmRlZmluZWRcblx0XHRlbHNlIHJlZHJhdygpXG5cdH0pXG5cdHZhciBjYWxsYmFja3MgPSBbXVxuXHRmdW5jdGlvbiBzdWJzY3JpYmUoa2V5MSwgY2FsbGJhY2spIHtcblx0XHR1bnN1YnNjcmliZShrZXkxKVxuXHRcdGNhbGxiYWNrcy5wdXNoKGtleTEsIHRocm90dGxlKGNhbGxiYWNrKSlcblx0fVxuXHRmdW5jdGlvbiB1bnN1YnNjcmliZShrZXkxKSB7XG5cdFx0dmFyIGluZGV4ID0gY2FsbGJhY2tzLmluZGV4T2Yoa2V5MSlcblx0XHRpZiAoaW5kZXggPiAtMSkgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMilcblx0fVxuXHRmdW5jdGlvbiByZWRyYXcoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpICs9IDIpIHtcblx0XHRcdGNhbGxiYWNrc1tpXSgpXG5cdFx0fVxuXHR9XG5cdHJldHVybiB7c3Vic2NyaWJlOiBzdWJzY3JpYmUsIHVuc3Vic2NyaWJlOiB1bnN1YnNjcmliZSwgcmVkcmF3OiByZWRyYXcsIHJlbmRlcjogcmVuZGVyU2VydmljZS5yZW5kZXJ9XG59XG52YXIgcmVkcmF3U2VydmljZSA9IF8xMSh3aW5kb3cpXG5yZXF1ZXN0U2VydmljZS5zZXRDb21wbGV0aW9uQ2FsbGJhY2socmVkcmF3U2VydmljZS5yZWRyYXcpXG52YXIgXzE2ID0gZnVuY3Rpb24ocmVkcmF3U2VydmljZTApIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHJvb3QsIGNvbXBvbmVudCkge1xuXHRcdGlmIChjb21wb25lbnQgPT09IG51bGwpIHtcblx0XHRcdHJlZHJhd1NlcnZpY2UwLnJlbmRlcihyb290LCBbXSlcblx0XHRcdHJlZHJhd1NlcnZpY2UwLnVuc3Vic2NyaWJlKHJvb3QpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0XG5cdFx0aWYgKGNvbXBvbmVudC52aWV3ID09IG51bGwgJiYgdHlwZW9mIGNvbXBvbmVudCAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJtLm1vdW50KGVsZW1lbnQsIGNvbXBvbmVudCkgZXhwZWN0cyBhIGNvbXBvbmVudCwgbm90IGEgdm5vZGVcIilcblx0XHRcblx0XHR2YXIgcnVuMCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVkcmF3U2VydmljZTAucmVuZGVyKHJvb3QsIFZub2RlKGNvbXBvbmVudCkpXG5cdFx0fVxuXHRcdHJlZHJhd1NlcnZpY2UwLnN1YnNjcmliZShyb290LCBydW4wKVxuXHRcdHJlZHJhd1NlcnZpY2UwLnJlZHJhdygpXG5cdH1cbn1cbm0ubW91bnQgPSBfMTYocmVkcmF3U2VydmljZSlcbnZhciBQcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG52YXIgcGFyc2VRdWVyeVN0cmluZyA9IGZ1bmN0aW9uKHN0cmluZykge1xuXHRpZiAoc3RyaW5nID09PSBcIlwiIHx8IHN0cmluZyA9PSBudWxsKSByZXR1cm4ge31cblx0aWYgKHN0cmluZy5jaGFyQXQoMCkgPT09IFwiP1wiKSBzdHJpbmcgPSBzdHJpbmcuc2xpY2UoMSlcblx0dmFyIGVudHJpZXMgPSBzdHJpbmcuc3BsaXQoXCImXCIpLCBkYXRhMCA9IHt9LCBjb3VudGVycyA9IHt9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBlbnRyeSA9IGVudHJpZXNbaV0uc3BsaXQoXCI9XCIpXG5cdFx0dmFyIGtleTUgPSBkZWNvZGVVUklDb21wb25lbnQoZW50cnlbMF0pXG5cdFx0dmFyIHZhbHVlID0gZW50cnkubGVuZ3RoID09PSAyID8gZGVjb2RlVVJJQ29tcG9uZW50KGVudHJ5WzFdKSA6IFwiXCJcblx0XHRpZiAodmFsdWUgPT09IFwidHJ1ZVwiKSB2YWx1ZSA9IHRydWVcblx0XHRlbHNlIGlmICh2YWx1ZSA9PT0gXCJmYWxzZVwiKSB2YWx1ZSA9IGZhbHNlXG5cdFx0dmFyIGxldmVscyA9IGtleTUuc3BsaXQoL1xcXVxcWz98XFxbLylcblx0XHR2YXIgY3Vyc29yID0gZGF0YTBcblx0XHRpZiAoa2V5NS5pbmRleE9mKFwiW1wiKSA+IC0xKSBsZXZlbHMucG9wKClcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGxldmVscy5sZW5ndGg7IGorKykge1xuXHRcdFx0dmFyIGxldmVsID0gbGV2ZWxzW2pdLCBuZXh0TGV2ZWwgPSBsZXZlbHNbaiArIDFdXG5cdFx0XHR2YXIgaXNOdW1iZXIgPSBuZXh0TGV2ZWwgPT0gXCJcIiB8fCAhaXNOYU4ocGFyc2VJbnQobmV4dExldmVsLCAxMCkpXG5cdFx0XHR2YXIgaXNWYWx1ZSA9IGogPT09IGxldmVscy5sZW5ndGggLSAxXG5cdFx0XHRpZiAobGV2ZWwgPT09IFwiXCIpIHtcblx0XHRcdFx0dmFyIGtleTUgPSBsZXZlbHMuc2xpY2UoMCwgaikuam9pbigpXG5cdFx0XHRcdGlmIChjb3VudGVyc1trZXk1XSA9PSBudWxsKSBjb3VudGVyc1trZXk1XSA9IDBcblx0XHRcdFx0bGV2ZWwgPSBjb3VudGVyc1trZXk1XSsrXG5cdFx0XHR9XG5cdFx0XHRpZiAoY3Vyc29yW2xldmVsXSA9PSBudWxsKSB7XG5cdFx0XHRcdGN1cnNvcltsZXZlbF0gPSBpc1ZhbHVlID8gdmFsdWUgOiBpc051bWJlciA/IFtdIDoge31cblx0XHRcdH1cblx0XHRcdGN1cnNvciA9IGN1cnNvcltsZXZlbF1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGRhdGEwXG59XG52YXIgY29yZVJvdXRlciA9IGZ1bmN0aW9uKCR3aW5kb3cpIHtcblx0dmFyIHN1cHBvcnRzUHVzaFN0YXRlID0gdHlwZW9mICR3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUgPT09IFwiZnVuY3Rpb25cIlxuXHR2YXIgY2FsbEFzeW5jMCA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IHNldFRpbWVvdXRcblx0ZnVuY3Rpb24gbm9ybWFsaXplMShmcmFnbWVudDApIHtcblx0XHR2YXIgZGF0YSA9ICR3aW5kb3cubG9jYXRpb25bZnJhZ21lbnQwXS5yZXBsYWNlKC8oPzolW2EtZjg5XVthLWYwLTldKSsvZ2ltLCBkZWNvZGVVUklDb21wb25lbnQpXG5cdFx0aWYgKGZyYWdtZW50MCA9PT0gXCJwYXRobmFtZVwiICYmIGRhdGFbMF0gIT09IFwiL1wiKSBkYXRhID0gXCIvXCIgKyBkYXRhXG5cdFx0cmV0dXJuIGRhdGFcblx0fVxuXHR2YXIgYXN5bmNJZFxuXHRmdW5jdGlvbiBkZWJvdW5jZUFzeW5jKGNhbGxiYWNrMCkge1xuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdGlmIChhc3luY0lkICE9IG51bGwpIHJldHVyblxuXHRcdFx0YXN5bmNJZCA9IGNhbGxBc3luYzAoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFzeW5jSWQgPSBudWxsXG5cdFx0XHRcdGNhbGxiYWNrMCgpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBwYXJzZVBhdGgocGF0aCwgcXVlcnlEYXRhLCBoYXNoRGF0YSkge1xuXHRcdHZhciBxdWVyeUluZGV4ID0gcGF0aC5pbmRleE9mKFwiP1wiKVxuXHRcdHZhciBoYXNoSW5kZXggPSBwYXRoLmluZGV4T2YoXCIjXCIpXG5cdFx0dmFyIHBhdGhFbmQgPSBxdWVyeUluZGV4ID4gLTEgPyBxdWVyeUluZGV4IDogaGFzaEluZGV4ID4gLTEgPyBoYXNoSW5kZXggOiBwYXRoLmxlbmd0aFxuXHRcdGlmIChxdWVyeUluZGV4ID4gLTEpIHtcblx0XHRcdHZhciBxdWVyeUVuZCA9IGhhc2hJbmRleCA+IC0xID8gaGFzaEluZGV4IDogcGF0aC5sZW5ndGhcblx0XHRcdHZhciBxdWVyeVBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcocGF0aC5zbGljZShxdWVyeUluZGV4ICsgMSwgcXVlcnlFbmQpKVxuXHRcdFx0Zm9yICh2YXIga2V5NCBpbiBxdWVyeVBhcmFtcykgcXVlcnlEYXRhW2tleTRdID0gcXVlcnlQYXJhbXNba2V5NF1cblx0XHR9XG5cdFx0aWYgKGhhc2hJbmRleCA+IC0xKSB7XG5cdFx0XHR2YXIgaGFzaFBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcocGF0aC5zbGljZShoYXNoSW5kZXggKyAxKSlcblx0XHRcdGZvciAodmFyIGtleTQgaW4gaGFzaFBhcmFtcykgaGFzaERhdGFba2V5NF0gPSBoYXNoUGFyYW1zW2tleTRdXG5cdFx0fVxuXHRcdHJldHVybiBwYXRoLnNsaWNlKDAsIHBhdGhFbmQpXG5cdH1cblx0dmFyIHJvdXRlciA9IHtwcmVmaXg6IFwiIyFcIn1cblx0cm91dGVyLmdldFBhdGggPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgdHlwZTIgPSByb3V0ZXIucHJlZml4LmNoYXJBdCgwKVxuXHRcdHN3aXRjaCAodHlwZTIpIHtcblx0XHRcdGNhc2UgXCIjXCI6IHJldHVybiBub3JtYWxpemUxKFwiaGFzaFwiKS5zbGljZShyb3V0ZXIucHJlZml4Lmxlbmd0aClcblx0XHRcdGNhc2UgXCI/XCI6IHJldHVybiBub3JtYWxpemUxKFwic2VhcmNoXCIpLnNsaWNlKHJvdXRlci5wcmVmaXgubGVuZ3RoKSArIG5vcm1hbGl6ZTEoXCJoYXNoXCIpXG5cdFx0XHRkZWZhdWx0OiByZXR1cm4gbm9ybWFsaXplMShcInBhdGhuYW1lXCIpLnNsaWNlKHJvdXRlci5wcmVmaXgubGVuZ3RoKSArIG5vcm1hbGl6ZTEoXCJzZWFyY2hcIikgKyBub3JtYWxpemUxKFwiaGFzaFwiKVxuXHRcdH1cblx0fVxuXHRyb3V0ZXIuc2V0UGF0aCA9IGZ1bmN0aW9uKHBhdGgsIGRhdGEsIG9wdGlvbnMpIHtcblx0XHR2YXIgcXVlcnlEYXRhID0ge30sIGhhc2hEYXRhID0ge31cblx0XHRwYXRoID0gcGFyc2VQYXRoKHBhdGgsIHF1ZXJ5RGF0YSwgaGFzaERhdGEpXG5cdFx0aWYgKGRhdGEgIT0gbnVsbCkge1xuXHRcdFx0Zm9yICh2YXIga2V5NCBpbiBkYXRhKSBxdWVyeURhdGFba2V5NF0gPSBkYXRhW2tleTRdXG5cdFx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKC86KFteXFwvXSspL2csIGZ1bmN0aW9uKG1hdGNoMiwgdG9rZW4pIHtcblx0XHRcdFx0ZGVsZXRlIHF1ZXJ5RGF0YVt0b2tlbl1cblx0XHRcdFx0cmV0dXJuIGRhdGFbdG9rZW5dXG5cdFx0XHR9KVxuXHRcdH1cblx0XHR2YXIgcXVlcnkgPSBidWlsZFF1ZXJ5U3RyaW5nKHF1ZXJ5RGF0YSlcblx0XHRpZiAocXVlcnkpIHBhdGggKz0gXCI/XCIgKyBxdWVyeVxuXHRcdHZhciBoYXNoID0gYnVpbGRRdWVyeVN0cmluZyhoYXNoRGF0YSlcblx0XHRpZiAoaGFzaCkgcGF0aCArPSBcIiNcIiArIGhhc2hcblx0XHRpZiAoc3VwcG9ydHNQdXNoU3RhdGUpIHtcblx0XHRcdHZhciBzdGF0ZSA9IG9wdGlvbnMgPyBvcHRpb25zLnN0YXRlIDogbnVsbFxuXHRcdFx0dmFyIHRpdGxlID0gb3B0aW9ucyA/IG9wdGlvbnMudGl0bGUgOiBudWxsXG5cdFx0XHQkd2luZG93Lm9ucG9wc3RhdGUoKVxuXHRcdFx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5yZXBsYWNlKSAkd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgcm91dGVyLnByZWZpeCArIHBhdGgpXG5cdFx0XHRlbHNlICR3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCByb3V0ZXIucHJlZml4ICsgcGF0aClcblx0XHR9XG5cdFx0ZWxzZSAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSByb3V0ZXIucHJlZml4ICsgcGF0aFxuXHR9XG5cdHJvdXRlci5kZWZpbmVSb3V0ZXMgPSBmdW5jdGlvbihyb3V0ZXMsIHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGZ1bmN0aW9uIHJlc29sdmVSb3V0ZSgpIHtcblx0XHRcdHZhciBwYXRoID0gcm91dGVyLmdldFBhdGgoKVxuXHRcdFx0dmFyIHBhcmFtcyA9IHt9XG5cdFx0XHR2YXIgcGF0aG5hbWUgPSBwYXJzZVBhdGgocGF0aCwgcGFyYW1zLCBwYXJhbXMpXG5cdFx0XHR2YXIgc3RhdGUgPSAkd2luZG93Lmhpc3Rvcnkuc3RhdGVcblx0XHRcdGlmIChzdGF0ZSAhPSBudWxsKSB7XG5cdFx0XHRcdGZvciAodmFyIGsgaW4gc3RhdGUpIHBhcmFtc1trXSA9IHN0YXRlW2tdXG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciByb3V0ZTAgaW4gcm91dGVzKSB7XG5cdFx0XHRcdHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChcIl5cIiArIHJvdXRlMC5yZXBsYWNlKC86W15cXC9dKz9cXC57M30vZywgXCIoLio/KVwiKS5yZXBsYWNlKC86W15cXC9dKy9nLCBcIihbXlxcXFwvXSspXCIpICsgXCJcXC8/JFwiKVxuXHRcdFx0XHRpZiAobWF0Y2hlci50ZXN0KHBhdGhuYW1lKSkge1xuXHRcdFx0XHRcdHBhdGhuYW1lLnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIga2V5cyA9IHJvdXRlMC5tYXRjaCgvOlteXFwvXSsvZykgfHwgW11cblx0XHRcdFx0XHRcdHZhciB2YWx1ZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgLTIpXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0cGFyYW1zW2tleXNbaV0ucmVwbGFjZSgvOnxcXC4vZywgXCJcIildID0gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tpXSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJlc29sdmUocm91dGVzW3JvdXRlMF0sIHBhcmFtcywgcGF0aCwgcm91dGUwKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJlamVjdChwYXRoLCBwYXJhbXMpXG5cdFx0fVxuXHRcdGlmIChzdXBwb3J0c1B1c2hTdGF0ZSkgJHdpbmRvdy5vbnBvcHN0YXRlID0gZGVib3VuY2VBc3luYyhyZXNvbHZlUm91dGUpXG5cdFx0ZWxzZSBpZiAocm91dGVyLnByZWZpeC5jaGFyQXQoMCkgPT09IFwiI1wiKSAkd2luZG93Lm9uaGFzaGNoYW5nZSA9IHJlc29sdmVSb3V0ZVxuXHRcdHJlc29sdmVSb3V0ZSgpXG5cdH1cblx0cmV0dXJuIHJvdXRlclxufVxudmFyIF8yMCA9IGZ1bmN0aW9uKCR3aW5kb3csIHJlZHJhd1NlcnZpY2UwKSB7XG5cdHZhciByb3V0ZVNlcnZpY2UgPSBjb3JlUm91dGVyKCR3aW5kb3cpXG5cdHZhciBpZGVudGl0eSA9IGZ1bmN0aW9uKHYpIHtyZXR1cm4gdn1cblx0dmFyIHJlbmRlcjEsIGNvbXBvbmVudCwgYXR0cnMzLCBjdXJyZW50UGF0aCwgbGFzdFVwZGF0ZVxuXHR2YXIgcm91dGUgPSBmdW5jdGlvbihyb290LCBkZWZhdWx0Um91dGUsIHJvdXRlcykge1xuXHRcdGlmIChyb290ID09IG51bGwpIHRocm93IG5ldyBFcnJvcihcIkVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgdGhhdCB3YXMgcGFzc2VkIHRvIGBtLnJvdXRlYCBpcyBub3QgdW5kZWZpbmVkXCIpXG5cdFx0dmFyIHJ1bjEgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmIChyZW5kZXIxICE9IG51bGwpIHJlZHJhd1NlcnZpY2UwLnJlbmRlcihyb290LCByZW5kZXIxKFZub2RlKGNvbXBvbmVudCwgYXR0cnMzLmtleSwgYXR0cnMzKSkpXG5cdFx0fVxuXHRcdHZhciBiYWlsID0gZnVuY3Rpb24ocGF0aCkge1xuXHRcdFx0aWYgKHBhdGggIT09IGRlZmF1bHRSb3V0ZSkgcm91dGVTZXJ2aWNlLnNldFBhdGgoZGVmYXVsdFJvdXRlLCBudWxsLCB7cmVwbGFjZTogdHJ1ZX0pXG5cdFx0XHRlbHNlIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCByZXNvbHZlIGRlZmF1bHQgcm91dGUgXCIgKyBkZWZhdWx0Um91dGUpXG5cdFx0fVxuXHRcdHJvdXRlU2VydmljZS5kZWZpbmVSb3V0ZXMocm91dGVzLCBmdW5jdGlvbihwYXlsb2FkLCBwYXJhbXMsIHBhdGgpIHtcblx0XHRcdHZhciB1cGRhdGUgPSBsYXN0VXBkYXRlID0gZnVuY3Rpb24ocm91dGVSZXNvbHZlciwgY29tcCkge1xuXHRcdFx0XHRpZiAodXBkYXRlICE9PSBsYXN0VXBkYXRlKSByZXR1cm5cblx0XHRcdFx0Y29tcG9uZW50ID0gY29tcCAhPSBudWxsICYmICh0eXBlb2YgY29tcC52aWV3ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIGNvbXAgPT09IFwiZnVuY3Rpb25cIik/IGNvbXAgOiBcImRpdlwiXG5cdFx0XHRcdGF0dHJzMyA9IHBhcmFtcywgY3VycmVudFBhdGggPSBwYXRoLCBsYXN0VXBkYXRlID0gbnVsbFxuXHRcdFx0XHRyZW5kZXIxID0gKHJvdXRlUmVzb2x2ZXIucmVuZGVyIHx8IGlkZW50aXR5KS5iaW5kKHJvdXRlUmVzb2x2ZXIpXG5cdFx0XHRcdHJ1bjEoKVxuXHRcdFx0fVxuXHRcdFx0aWYgKHBheWxvYWQudmlldyB8fCB0eXBlb2YgcGF5bG9hZCA9PT0gXCJmdW5jdGlvblwiKSB1cGRhdGUoe30sIHBheWxvYWQpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKHBheWxvYWQub25tYXRjaCkge1xuXHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZShwYXlsb2FkLm9ubWF0Y2gocGFyYW1zLCBwYXRoKSkudGhlbihmdW5jdGlvbihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdFx0dXBkYXRlKHBheWxvYWQsIHJlc29sdmVkKVxuXHRcdFx0XHRcdH0sIGJhaWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB1cGRhdGUocGF5bG9hZCwgXCJkaXZcIilcblx0XHRcdH1cblx0XHR9LCBiYWlsKVxuXHRcdHJlZHJhd1NlcnZpY2UwLnN1YnNjcmliZShyb290LCBydW4xKVxuXHR9XG5cdHJvdXRlLnNldCA9IGZ1bmN0aW9uKHBhdGgsIGRhdGEsIG9wdGlvbnMpIHtcblx0XHRpZiAobGFzdFVwZGF0ZSAhPSBudWxsKSB7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXHRcdFx0b3B0aW9ucy5yZXBsYWNlID0gdHJ1ZVxuXHRcdH1cblx0XHRsYXN0VXBkYXRlID0gbnVsbFxuXHRcdHJvdXRlU2VydmljZS5zZXRQYXRoKHBhdGgsIGRhdGEsIG9wdGlvbnMpXG5cdH1cblx0cm91dGUuZ2V0ID0gZnVuY3Rpb24oKSB7cmV0dXJuIGN1cnJlbnRQYXRofVxuXHRyb3V0ZS5wcmVmaXggPSBmdW5jdGlvbihwcmVmaXgwKSB7cm91dGVTZXJ2aWNlLnByZWZpeCA9IHByZWZpeDB9XG5cdHJvdXRlLmxpbmsgPSBmdW5jdGlvbih2bm9kZTEpIHtcblx0XHR2bm9kZTEuZG9tLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgcm91dGVTZXJ2aWNlLnByZWZpeCArIHZub2RlMS5hdHRycy5ocmVmKVxuXHRcdHZub2RlMS5kb20ub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcblx0XHRcdGlmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5IHx8IGUuc2hpZnRLZXkgfHwgZS53aGljaCA9PT0gMikgcmV0dXJuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRcdGUucmVkcmF3ID0gZmFsc2Vcblx0XHRcdHZhciBocmVmID0gdGhpcy5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpXG5cdFx0XHRpZiAoaHJlZi5pbmRleE9mKHJvdXRlU2VydmljZS5wcmVmaXgpID09PSAwKSBocmVmID0gaHJlZi5zbGljZShyb3V0ZVNlcnZpY2UucHJlZml4Lmxlbmd0aClcblx0XHRcdHJvdXRlLnNldChocmVmLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcblx0XHR9XG5cdH1cblx0cm91dGUucGFyYW0gPSBmdW5jdGlvbihrZXkzKSB7XG5cdFx0aWYodHlwZW9mIGF0dHJzMyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2Yga2V5MyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGF0dHJzM1trZXkzXVxuXHRcdHJldHVybiBhdHRyczNcblx0fVxuXHRyZXR1cm4gcm91dGVcbn1cbm0ucm91dGUgPSBfMjAod2luZG93LCByZWRyYXdTZXJ2aWNlKVxubS53aXRoQXR0ciA9IGZ1bmN0aW9uKGF0dHJOYW1lLCBjYWxsYmFjazEsIGNvbnRleHQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcblx0XHRjYWxsYmFjazEuY2FsbChjb250ZXh0IHx8IHRoaXMsIGF0dHJOYW1lIGluIGUuY3VycmVudFRhcmdldCA/IGUuY3VycmVudFRhcmdldFthdHRyTmFtZV0gOiBlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKGF0dHJOYW1lKSlcblx0fVxufVxudmFyIF8yOCA9IGNvcmVSZW5kZXJlcih3aW5kb3cpXG5tLnJlbmRlciA9IF8yOC5yZW5kZXJcbm0ucmVkcmF3ID0gcmVkcmF3U2VydmljZS5yZWRyYXdcbm0ucmVxdWVzdCA9IHJlcXVlc3RTZXJ2aWNlLnJlcXVlc3Rcbm0uanNvbnAgPSByZXF1ZXN0U2VydmljZS5qc29ucFxubS5wYXJzZVF1ZXJ5U3RyaW5nID0gcGFyc2VRdWVyeVN0cmluZ1xubS5idWlsZFF1ZXJ5U3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZ1xubS52ZXJzaW9uID0gXCIxLjEuNFwiXG5tLnZub2RlID0gVm5vZGVcbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiKSBtb2R1bGVbXCJleHBvcnRzXCJdID0gbVxuZWxzZSB3aW5kb3cubSA9IG1cbn0oKSk7IiwiLypcbkNvcHlyaWdodCAoYykgMjAxNSwgWWFob28hIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkNvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cblNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG5cbkF1dGhvcnM6IE5lcmEgTGl1IDxuZXJhbGl1QHlhaG9vLWluYy5jb20+XG4gICAgICAgICBBZG9uaXMgRnVuZyA8YWRvbkB5YWhvby1pbmMuY29tPlxuICAgICAgICAgQWxiZXJ0IFl1IDxhbGJlcnR5dUB5YWhvby1pbmMuY29tPlxuKi9cbi8qanNoaW50IG5vZGU6IHRydWUgKi9cblxuZXhwb3J0cy5fZ2V0UHJpdkZpbHRlcnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgTFQgICAgID0gLzwvZyxcbiAgICAgICAgUVVPVCAgID0gL1wiL2csXG4gICAgICAgIFNRVU9UICA9IC8nL2csXG4gICAgICAgIEFNUCAgICA9IC8mL2csXG4gICAgICAgIE5VTEwgICA9IC9cXHgwMC9nLFxuICAgICAgICBTUEVDSUFMX0FUVFJfVkFMVUVfVU5RVU9URURfQ0hBUlMgPSAvKD86XiR8W1xceDAwXFx4MDktXFx4MEQgXCInYD08Pl0pL2csXG4gICAgICAgIFNQRUNJQUxfSFRNTF9DSEFSUyA9IC9bJjw+XCInYF0vZywgXG4gICAgICAgIFNQRUNJQUxfQ09NTUVOVF9DSEFSUyA9IC8oPzpcXHgwMHxeLSohPz58LS0hPz58LS0/IT8kfFxcXT58XFxdJCkvZztcblxuICAgIC8vIENTUyBzZW5zaXRpdmUgY2hhcnM6ICgpXCInLywhKkB7fTo7XG4gICAgLy8gQnkgQ1NTOiAoVGFifE5ld0xpbmV8Y29sb258c2VtaXxscGFyfHJwYXJ8YXBvc3xzb2x8Y29tbWF8ZXhjbHxhc3R8bWlkYXN0KTt8KHF1b3R8UVVPVClcbiAgICAvLyBCeSBVUklfUFJPVE9DT0w6IChUYWJ8TmV3TGluZSk7XG4gICAgdmFyIFNFTlNJVElWRV9IVE1MX0VOVElUSUVTID0gLyYoPzojKFt4WF1bMC05QS1GYS1mXSt8XFxkKyk7P3woVGFifE5ld0xpbmV8Y29sb258c2VtaXxscGFyfHJwYXJ8YXBvc3xzb2x8Y29tbWF8ZXhjbHxhc3R8bWlkYXN0fGVuc3B8ZW1zcHx0aGluc3ApO3wobmJzcHxhbXB8QU1QfGx0fExUfGd0fEdUfHF1b3R8UVVPVCk7PykvZyxcbiAgICAgICAgU0VOU0lUSVZFX05BTUVEX1JFRl9NQVAgPSB7VGFiOiAnXFx0JywgTmV3TGluZTogJ1xcbicsIGNvbG9uOiAnOicsIHNlbWk6ICc7JywgbHBhcjogJygnLCBycGFyOiAnKScsIGFwb3M6ICdcXCcnLCBzb2w6ICcvJywgY29tbWE6ICcsJywgZXhjbDogJyEnLCBhc3Q6ICcqJywgbWlkYXN0OiAnKicsIGVuc3A6ICdcXHUyMDAyJywgZW1zcDogJ1xcdTIwMDMnLCB0aGluc3A6ICdcXHUyMDA5JywgbmJzcDogJ1xceEEwJywgYW1wOiAnJicsIGx0OiAnPCcsIGd0OiAnPicsIHF1b3Q6ICdcIicsIFFVT1Q6ICdcIid9O1xuXG4gICAgLy8gdmFyIENTU19WQUxJRF9WQUxVRSA9IFxuICAgIC8vICAgICAvXig/OlxuICAgIC8vICAgICAoPyEtKmV4cHJlc3Npb24pIz9bLVxcd10rXG4gICAgLy8gICAgIHxbKy1dPyg/OlxcZCt8XFxkKlxcLlxcZCspKD86ZW18ZXh8Y2h8cmVtfHB4fG1tfGNtfGlufHB0fHBjfCV8dmh8dnd8dm1pbnx2bWF4KT9cbiAgICAvLyAgICAgfCFpbXBvcnRhbnRcbiAgICAvLyAgICAgfCAvL2VtcHR5XG4gICAgLy8gICAgICkkL2k7XG4gICAgdmFyIENTU19WQUxJRF9WQUxVRSA9IC9eKD86KD8hLSpleHByZXNzaW9uKSM/Wy1cXHddK3xbKy1dPyg/OlxcZCt8XFxkKlxcLlxcZCspKD86cj9lbXxleHxjaHxjbXxtbXxpbnxweHxwdHxwY3wlfHZofHZ3fHZtaW58dm1heCk/fCFpbXBvcnRhbnR8KSQvaSxcbiAgICAgICAgLy8gVE9ETzogcHJldmVudCBkb3VibGUgY3NzIGVzY2FwaW5nIGJ5IG5vdCBlbmNvZGluZyBcXCBhZ2FpbiwgYnV0IHRoaXMgbWF5IHJlcXVpcmUgQ1NTIGRlY29kaW5nXG4gICAgICAgIC8vIFxceDdGIGFuZCBcXHgwMS1cXHgxRiBsZXNzIFxceDA5IGFyZSBmb3IgU2FmYXJpIDUuMCwgYWRkZWQgW117fS8qIGZvciB1bmJhbGFuY2VkIHF1b3RlXG4gICAgICAgIENTU19ET1VCTEVfUVVPVEVEX0NIQVJTID0gL1tcXHgwMC1cXHgxRlxceDdGXFxbXFxde31cXFxcXCJdL2csXG4gICAgICAgIENTU19TSU5HTEVfUVVPVEVEX0NIQVJTID0gL1tcXHgwMC1cXHgxRlxceDdGXFxbXFxde31cXFxcJ10vZyxcbiAgICAgICAgLy8gKCwgXFx1MjA3RCBhbmQgXFx1MjA4RCBjYW4gYmUgdXNlZCBpbiBiYWNrZ3JvdW5kOiAndXJsKC4uLiknIGluIElFLCBhc3N1bWVkIGFsbCBcXCBjaGFycyBhcmUgZW5jb2RlZCBieSBRVU9URURfQ0hBUlMsIGFuZCBudWxsIGlzIGFscmVhZHkgcmVwbGFjZWQgd2l0aCBcXHVGRkZEXG4gICAgICAgIC8vIG90aGVyd2lzZSwgdXNlIHRoaXMgQ1NTX0JMQUNLTElTVCBpbnN0ZWFkIChlbmhhbmNlIGl0IHdpdGggdXJsIG1hdGNoaW5nKTogLyg/OlxcXFw/XFwofFtcXHUyMDdEXFx1MjA4RF18XFxcXDB7MCw0fTI4ID98XFxcXDB7MCwyfTIwWzc4XVtEZF0gPykrL2dcbiAgICAgICAgQ1NTX0JMQUNLTElTVCA9IC91cmxbXFwoXFx1MjA3RFxcdTIwOERdKy9nLFxuICAgICAgICAvLyB0aGlzIGFzc3VtZXMgZW5jb2RlVVJJKCkgYW5kIGVuY29kZVVSSUNvbXBvbmVudCgpIGhhcyBlc2NhcGVkIDEtMzIsIDEyNyBmb3IgSUU4XG4gICAgICAgIENTU19VTlFVT1RFRF9VUkwgPSAvWydcXChcXCldL2c7IC8vIFwiIFxcIHRyZWF0ZWQgYnkgZW5jb2RlVVJJKClcblxuICAgIC8vIEdpdmVuIGEgZnVsbCBVUkksIG5lZWQgdG8gc3VwcG9ydCBcIltcIiAoIElQdjZhZGRyZXNzICkgXCJdXCIgaW4gVVJJIGFzIHBlciBSRkMzOTg2XG4gICAgLy8gUmVmZXJlbmNlOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlxuICAgIHZhciBVUkxfSVBWNiA9IC9cXC9cXC8lNVtCYl0oW0EtRmEtZjAtOTpdKyklNVtEZF0vO1xuXG5cbiAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL2RhdGFiYXNlL0FsbC9jaGFyYWN0ZXJzLWFsbG93ZC1pbi1odG1sLWVudGl0aWVzXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy1hbGxvd2VkLWFmdGVyLWFtcGVyc2FuZC1pbi1uYW1lZC1jaGFyYWN0ZXItcmVmZXJlbmNlc1xuICAgIC8vIFJlZmVyZW5jZTogaHR0cDovL3NoYXp6ZXIuY28udWsvZGF0YWJhc2UvQWxsL0NoYXJhY3RlcnMtYmVmb3JlLWphdmFzY3JpcHQtdXJpXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay9kYXRhYmFzZS9BbGwvQ2hhcmFjdGVycy1hZnRlci1qYXZhc2NyaXB0LXVyaVxuICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29uc3VtZS1hLWNoYXJhY3Rlci1yZWZlcmVuY2VcbiAgICAvLyBSZWZlcmVuY2UgZm9yIG5hbWVkIGNoYXJhY3RlcnM6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2VudGl0aWVzLmpzb25cbiAgICB2YXIgVVJJX0JMQUNLTElTVF9QUk9UT0NPTFMgPSB7J2phdmFzY3JpcHQnOjEsICdkYXRhJzoxLCAndmJzY3JpcHQnOjEsICdtaHRtbCc6MSwgJ3gtc2NoZW1hJzoxfSxcbiAgICAgICAgVVJJX1BST1RPQ09MX0NPTE9OID0gLyg/Ojp8JiNbeFhdMCozW2FBXTs/fCYjMCo1ODs/fCZjb2xvbjspLyxcbiAgICAgICAgVVJJX1BST1RPQ09MX1dISVRFU1BBQ0VTID0gLyg/Ol5bXFx4MDAtXFx4MjBdK3xbXFx0XFxuXFxyXFx4MDBdKykvZyxcbiAgICAgICAgVVJJX1BST1RPQ09MX05BTUVEX1JFRl9NQVAgPSB7VGFiOiAnXFx0JywgTmV3TGluZTogJ1xcbid9O1xuXG4gICAgdmFyIHgsIFxuICAgICAgICBzdHJSZXBsYWNlID0gZnVuY3Rpb24gKHMsIHJlZ2V4cCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBzID09PSB1bmRlZmluZWQgPyAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICA6IHMgPT09IG51bGwgICAgICAgICAgICA/ICdudWxsJ1xuICAgICAgICAgICAgICAgICAgICA6IHMudG9TdHJpbmcoKS5yZXBsYWNlKHJlZ2V4cCwgY2FsbGJhY2spO1xuICAgICAgICB9LFxuICAgICAgICBmcm9tQ29kZVBvaW50ID0gU3RyaW5nLmZyb21Db2RlUG9pbnQgfHwgZnVuY3Rpb24oY29kZVBvaW50KSB7XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2RlUG9pbnQgPD0gMHhGRkZGKSB7IC8vIEJNUCBjb2RlIHBvaW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVBvaW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQXN0cmFsIGNvZGUgcG9pbnQ7IHNwbGl0IGluIHN1cnJvZ2F0ZSBoYWx2ZXNcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmcjc3Vycm9nYXRlLWZvcm11bGFlXG4gICAgICAgICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKChjb2RlUG9pbnQgPj4gMTApICsgMHhEODAwLCAoY29kZVBvaW50ICUgMHg0MDApICsgMHhEQzAwKTtcbiAgICAgICAgfTtcblxuXG4gICAgZnVuY3Rpb24gZ2V0UHJvdG9jb2woc3RyKSB7XG4gICAgICAgIHZhciBzID0gc3RyLnNwbGl0KFVSSV9QUk9UT0NPTF9DT0xPTiwgMik7XG4gICAgICAgIC8vIHN0ci5sZW5ndGggIT09IHNbMF0ubGVuZ3RoIGlzIGZvciBvbGRlciBJRSAoZS5nLiwgdjgpLCB3aGVyZSBkZWxpbWV0ZXIgcmVzaWRpbmcgYXQgbGFzdCB3aWxsIHJlc3VsdCBpbiBsZW5ndGggZXF1YWxzIDEsIGJ1dCBub3QgMlxuICAgICAgICByZXR1cm4gKHNbMF0gJiYgKHMubGVuZ3RoID09PSAyIHx8IHN0ci5sZW5ndGggIT09IHNbMF0ubGVuZ3RoKSkgPyBzWzBdIDogbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBodG1sRGVjb2RlKHMsIG5hbWVkUmVmTWFwLCByZU5hbWVkUmVmLCBza2lwUmVwbGFjZW1lbnQpIHtcbiAgICAgICAgXG4gICAgICAgIG5hbWVkUmVmTWFwID0gbmFtZWRSZWZNYXAgfHwgU0VOU0lUSVZFX05BTUVEX1JFRl9NQVA7XG4gICAgICAgIHJlTmFtZWRSZWYgPSByZU5hbWVkUmVmIHx8IFNFTlNJVElWRV9IVE1MX0VOVElUSUVTO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlZ0V4cEZ1bmN0aW9uKG0sIG51bSwgbmFtZWQsIG5hbWVkMSkge1xuICAgICAgICAgICAgaWYgKG51bSkge1xuICAgICAgICAgICAgICAgIG51bSA9IE51bWJlcihudW1bMF0gPD0gJzknID8gbnVtIDogJzAnICsgbnVtKTtcbiAgICAgICAgICAgICAgICAvLyBzd2l0Y2gobnVtKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4MDogcmV0dXJuICdcXHUyMEFDJzsgIC8vIEVVUk8gU0lHTiAo4oKsKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4ODI6IHJldHVybiAnXFx1MjAxQSc7ICAvLyBTSU5HTEUgTE9XLTkgUVVPVEFUSU9OIE1BUksgKOKAmilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDgzOiByZXR1cm4gJ1xcdTAxOTInOyAgLy8gTEFUSU4gU01BTEwgTEVUVEVSIEYgV0lUSCBIT09LICjGkilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg0OiByZXR1cm4gJ1xcdTIwMUUnOyAgLy8gRE9VQkxFIExPVy05IFFVT1RBVElPTiBNQVJLICjigJ4pXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4NTogcmV0dXJuICdcXHUyMDI2JzsgIC8vIEhPUklaT05UQUwgRUxMSVBTSVMgKOKApilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg2OiByZXR1cm4gJ1xcdTIwMjAnOyAgLy8gREFHR0VSICjigKApXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4NzogcmV0dXJuICdcXHUyMDIxJzsgIC8vIERPVUJMRSBEQUdHRVIgKOKAoSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg4OiByZXR1cm4gJ1xcdTAyQzYnOyAgLy8gTU9ESUZJRVIgTEVUVEVSIENJUkNVTUZMRVggQUNDRU5UICjLhilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg5OiByZXR1cm4gJ1xcdTIwMzAnOyAgLy8gUEVSIE1JTExFIFNJR04gKOKAsClcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDhBOiByZXR1cm4gJ1xcdTAxNjAnOyAgLy8gTEFUSU4gQ0FQSVRBTCBMRVRURVIgUyBXSVRIIENBUk9OICjFoClcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDhCOiByZXR1cm4gJ1xcdTIwMzknOyAgLy8gU0lOR0xFIExFRlQtUE9JTlRJTkcgQU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAuSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDhDOiByZXR1cm4gJ1xcdTAxNTInOyAgLy8gTEFUSU4gQ0FQSVRBTCBMSUdBVFVSRSBPRSAoxZIpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4RTogcmV0dXJuICdcXHUwMTdEJzsgIC8vIExBVElOIENBUElUQUwgTEVUVEVSIFogV0lUSCBDQVJPTiAoxb0pXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5MTogcmV0dXJuICdcXHUyMDE4JzsgIC8vIExFRlQgU0lOR0xFIFFVT1RBVElPTiBNQVJLICjigJgpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5MjogcmV0dXJuICdcXHUyMDE5JzsgIC8vIFJJR0hUIFNJTkdMRSBRVU9UQVRJT04gTUFSSyAo4oCZKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OTM6IHJldHVybiAnXFx1MjAxQyc7ICAvLyBMRUZUIERPVUJMRSBRVU9UQVRJT04gTUFSSyAo4oCcKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OTQ6IHJldHVybiAnXFx1MjAxRCc7ICAvLyBSSUdIVCBET1VCTEUgUVVPVEFUSU9OIE1BUksgKOKAnSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDk1OiByZXR1cm4gJ1xcdTIwMjInOyAgLy8gQlVMTEVUICjigKIpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5NjogcmV0dXJuICdcXHUyMDEzJzsgIC8vIEVOIERBU0ggKOKAkylcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDk3OiByZXR1cm4gJ1xcdTIwMTQnOyAgLy8gRU0gREFTSCAo4oCUKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OTg6IHJldHVybiAnXFx1MDJEQyc7ICAvLyBTTUFMTCBUSUxERSAoy5wpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5OTogcmV0dXJuICdcXHUyMTIyJzsgIC8vIFRSQURFIE1BUksgU0lHTiAo4oSiKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OUE6IHJldHVybiAnXFx1MDE2MSc7ICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgUyBXSVRIIENBUk9OICjFoSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDlCOiByZXR1cm4gJ1xcdTIwM0EnOyAgLy8gU0lOR0xFIFJJR0hULVBPSU5USU5HIEFOR0xFIFFVT1RBVElPTiBNQVJLICjigLopXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5QzogcmV0dXJuICdcXHUwMTUzJzsgIC8vIExBVElOIFNNQUxMIExJR0FUVVJFIE9FICjFkylcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDlFOiByZXR1cm4gJ1xcdTAxN0UnOyAgLy8gTEFUSU4gU01BTEwgTEVUVEVSIFogV0lUSCBDQVJPTiAoxb4pXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5RjogcmV0dXJuICdcXHUwMTc4JzsgIC8vIExBVElOIENBUElUQUwgTEVUVEVSIFkgV0lUSCBESUFFUkVTSVMgKMW4KVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAvLyAvLyBudW0gPj0gMHhEODAwICYmIG51bSA8PSAweERGRkYsIGFuZCAweDBEIGlzIHNlcGFyYXRlbHkgaGFuZGxlZCwgYXMgaXQgZG9lc24ndCBmYWxsIGludG8gdGhlIHJhbmdlIG9mIHgucGVjKClcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gKG51bSA+PSAweEQ4MDAgJiYgbnVtIDw9IDB4REZGRikgfHwgbnVtID09PSAweDBEID8gJ1xcdUZGRkQnIDogeC5mckNvUHQobnVtKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBza2lwUmVwbGFjZW1lbnQgPyBmcm9tQ29kZVBvaW50KG51bSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDgwID8gJ1xcdTIwQUMnICAvLyBFVVJPIFNJR04gKOKCrClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDgyID8gJ1xcdTIwMUEnICAvLyBTSU5HTEUgTE9XLTkgUVVPVEFUSU9OIE1BUksgKOKAmilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDgzID8gJ1xcdTAxOTInICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgRiBXSVRIIEhPT0sgKMaSKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODQgPyAnXFx1MjAxRScgIC8vIERPVUJMRSBMT1ctOSBRVU9UQVRJT04gTUFSSyAo4oCeKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODUgPyAnXFx1MjAyNicgIC8vIEhPUklaT05UQUwgRUxMSVBTSVMgKOKApilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDg2ID8gJ1xcdTIwMjAnICAvLyBEQUdHRVIgKOKAoClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDg3ID8gJ1xcdTIwMjEnICAvLyBET1VCTEUgREFHR0VSICjigKEpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg4OCA/ICdcXHUwMkM2JyAgLy8gTU9ESUZJRVIgTEVUVEVSIENJUkNVTUZMRVggQUNDRU5UICjLhilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDg5ID8gJ1xcdTIwMzAnICAvLyBQRVIgTUlMTEUgU0lHTiAo4oCwKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OEEgPyAnXFx1MDE2MCcgIC8vIExBVElOIENBUElUQUwgTEVUVEVSIFMgV0lUSCBDQVJPTiAoxaApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg4QiA/ICdcXHUyMDM5JyAgLy8gU0lOR0xFIExFRlQtUE9JTlRJTkcgQU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAuSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDhDID8gJ1xcdTAxNTInICAvLyBMQVRJTiBDQVBJVEFMIExJR0FUVVJFIE9FICjFkilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDhFID8gJ1xcdTAxN0QnICAvLyBMQVRJTiBDQVBJVEFMIExFVFRFUiBaIFdJVEggQ0FST04gKMW9KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OTEgPyAnXFx1MjAxOCcgIC8vIExFRlQgU0lOR0xFIFFVT1RBVElPTiBNQVJLICjigJgpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5MiA/ICdcXHUyMDE5JyAgLy8gUklHSFQgU0lOR0xFIFFVT1RBVElPTiBNQVJLICjigJkpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5MyA/ICdcXHUyMDFDJyAgLy8gTEVGVCBET1VCTEUgUVVPVEFUSU9OIE1BUksgKOKAnClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk0ID8gJ1xcdTIwMUQnICAvLyBSSUdIVCBET1VCTEUgUVVPVEFUSU9OIE1BUksgKOKAnSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk1ID8gJ1xcdTIwMjInICAvLyBCVUxMRVQgKOKAoilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk2ID8gJ1xcdTIwMTMnICAvLyBFTiBEQVNIICjigJMpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5NyA/ICdcXHUyMDE0JyAgLy8gRU0gREFTSCAo4oCUKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OTggPyAnXFx1MDJEQycgIC8vIFNNQUxMIFRJTERFICjLnClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk5ID8gJ1xcdTIxMjInICAvLyBUUkFERSBNQVJLIFNJR04gKOKEoilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDlBID8gJ1xcdTAxNjEnICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgUyBXSVRIIENBUk9OICjFoSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDlCID8gJ1xcdTIwM0EnICAvLyBTSU5HTEUgUklHSFQtUE9JTlRJTkcgQU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAuilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDlDID8gJ1xcdTAxNTMnICAvLyBMQVRJTiBTTUFMTCBMSUdBVFVSRSBPRSAoxZMpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5RSA/ICdcXHUwMTdFJyAgLy8gTEFUSU4gU01BTEwgTEVUVEVSIFogV0lUSCBDQVJPTiAoxb4pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5RiA/ICdcXHUwMTc4JyAgLy8gTEFUSU4gQ0FQSVRBTCBMRVRURVIgWSBXSVRIIERJQUVSRVNJUyAoxbgpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IChudW0gPj0gMHhEODAwICYmIG51bSA8PSAweERGRkYpIHx8IG51bSA9PT0gMHgwRCA/ICdcXHVGRkZEJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiB4LmZyQ29QdChudW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5hbWVkUmVmTWFwW25hbWVkIHx8IG5hbWVkMV0gfHwgbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzID09PSB1bmRlZmluZWQgID8gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIDogcyA9PT0gbnVsbCAgICAgICAgPyAnbnVsbCdcbiAgICAgICAgICAgIDogcy50b1N0cmluZygpLnJlcGxhY2UoTlVMTCwgJ1xcdUZGRkQnKS5yZXBsYWNlKHJlTmFtZWRSZWYsIHJlZ0V4cEZ1bmN0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjc3NFbmNvZGUoY2hyKSB7XG4gICAgICAgIC8vIHNwYWNlIGFmdGVyIFxcXFxIRVggaXMgbmVlZGVkIGJ5IHNwZWNcbiAgICAgICAgcmV0dXJuICdcXFxcJyArIGNoci5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b0xvd2VyQ2FzZSgpICsgJyAnO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjc3NCbGFja2xpc3Qocykge1xuICAgICAgICByZXR1cm4gcy5yZXBsYWNlKENTU19CTEFDS0xJU1QsIGZ1bmN0aW9uKG0peyByZXR1cm4gJy14LScgKyBtOyB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3NzVXJsKHMpIHtcbiAgICAgICAgLy8gZW5jb2RlVVJJKCkgaW4geXVmdWxsKCkgd2lsbCB0aHJvdyBlcnJvciBmb3IgdXNlIG9mIHRoZSBDU1NfVU5TVVBQT1JURURfQ09ERV9QT0lOVCAoaS5lLiwgW1xcdUQ4MDAtXFx1REZGRl0pXG4gICAgICAgIHMgPSB4Lnl1ZnVsbChodG1sRGVjb2RlKHMpKTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gZ2V0UHJvdG9jb2wocyk7XG5cbiAgICAgICAgLy8gcHJlZml4ICMjIGZvciBibGFja2xpc3RlZCBwcm90b2NvbHNcbiAgICAgICAgLy8gaGVyZSAucmVwbGFjZShVUklfUFJPVE9DT0xfV0hJVEVTUEFDRVMsICcnKSBpcyBub3QgbmVlZGVkIHNpbmNlIHl1ZnVsbCBoYXMgYWxyZWFkeSBwZXJjZW50LWVuY29kZWQgdGhlIHdoaXRlc3BhY2VzXG4gICAgICAgIHJldHVybiAocHJvdG9jb2wgJiYgVVJJX0JMQUNLTElTVF9QUk9UT0NPTFNbcHJvdG9jb2wudG9Mb3dlckNhc2UoKV0pID8gJyMjJyArIHMgOiBzO1xuICAgIH1cblxuICAgIHJldHVybiAoeCA9IHtcbiAgICAgICAgLy8gdHVybiBpbnZhbGlkIGNvZGVQb2ludHMgYW5kIHRoYXQgb2Ygbm9uLWNoYXJhY3RlcnMgdG8gXFx1RkZGRCwgYW5kIHRoZW4gZnJvbUNvZGVQb2ludCgpXG4gICAgICAgIGZyQ29QdDogZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVtID09PSB1bmRlZmluZWQgfHwgbnVtID09PSBudWxsID8gJycgOlxuICAgICAgICAgICAgICAgICFpc0Zpbml0ZShudW0gPSBOdW1iZXIobnVtKSkgfHwgLy8gYE5hTmAsIGArSW5maW5pdHlgLCBvciBgLUluZmluaXR5YFxuICAgICAgICAgICAgICAgIG51bSA8PSAwIHx8ICAgICAgICAgICAgICAgICAgICAgLy8gbm90IGEgdmFsaWQgVW5pY29kZSBjb2RlIHBvaW50XG4gICAgICAgICAgICAgICAgbnVtID4gMHgxMEZGRkYgfHwgICAgICAgICAgICAgICAvLyBub3QgYSB2YWxpZCBVbmljb2RlIGNvZGUgcG9pbnRcbiAgICAgICAgICAgICAgICAvLyBNYXRoLmZsb29yKG51bSkgIT0gbnVtIHx8IFxuXG4gICAgICAgICAgICAgICAgKG51bSA+PSAweDAxICYmIG51bSA8PSAweDA4KSB8fFxuICAgICAgICAgICAgICAgIChudW0gPj0gMHgwRSAmJiBudW0gPD0gMHgxRikgfHxcbiAgICAgICAgICAgICAgICAobnVtID49IDB4N0YgJiYgbnVtIDw9IDB4OUYpIHx8XG4gICAgICAgICAgICAgICAgKG51bSA+PSAweEZERDAgJiYgbnVtIDw9IDB4RkRFRikgfHxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgbnVtID09PSAweDBCIHx8IFxuICAgICAgICAgICAgICAgIChudW0gJiAweEZGRkYpID09PSAweEZGRkYgfHwgXG4gICAgICAgICAgICAgICAgKG51bSAmIDB4RkZGRikgPT09IDB4RkZGRSA/ICdcXHVGRkZEJyA6IGZyb21Db2RlUG9pbnQobnVtKTtcbiAgICAgICAgfSxcbiAgICAgICAgZDogaHRtbERlY29kZSxcbiAgICAgICAgLypcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXJpIGlucHV0XG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHMgLSBudWxsIGlmIHJlbGF0aXZlIHVybCwgb3RoZXJ3aXNlIHRoZSBwcm90b2NvbCB3aXRoIHdoaXRlc3BhY2VzIHN0cmlwcGVkIGFuZCBsb3dlci1jYXNlZFxuICAgICAgICAgKi9cbiAgICAgICAgeXVwOiBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICBzID0gZ2V0UHJvdG9jb2wocy5yZXBsYWNlKE5VTEwsICcnKSk7XG4gICAgICAgICAgICAvLyBVUklfUFJPVE9DT0xfV0hJVEVTUEFDRVMgaXMgcmVxdWlyZWQgZm9yIGxlZnQgdHJpbSBhbmQgcmVtb3ZlIGludGVyaW0gd2hpdGVzcGFjZXNcbiAgICAgICAgICAgIHJldHVybiBzID8gaHRtbERlY29kZShzLCBVUklfUFJPVE9DT0xfTkFNRURfUkVGX01BUCwgbnVsbCwgdHJ1ZSkucmVwbGFjZShVUklfUFJPVE9DT0xfV0hJVEVTUEFDRVMsICcnKS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHMgLSBUaGUgb3JpZ2luYWwgdXNlciBpbnB1dCB3aXRoICYgPCA+IFwiICcgYCBlbmNvZGVkIHJlc3BlY3RpdmVseSBhcyAmYW1wOyAmbHQ7ICZndDsgJnF1b3Q7ICYjMzk7IGFuZCAmIzk2Oy5cbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIHk6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJSZXBsYWNlKHMsIFNQRUNJQUxfSFRNTF9DSEFSUywgZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSA9PT0gJyYnID8gJyZhbXA7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnPCcgPyAnJmx0OydcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJz4nID8gJyZndDsnXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICdcIicgPyAnJnF1b3Q7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSBcIidcIiA/ICcmIzM5OydcbiAgICAgICAgICAgICAgICAgICAgOiAgLyptID09PSAnYCcqLyAnJiM5NjsnOyAgICAgICAvLyBpbiBoZXg6IDYwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGlzIGZpbHRlciBpcyBtZWFudCB0byBpbnRyb2R1Y2UgZG91YmxlLWVuY29kaW5nLCBhbmQgc2hvdWxkIGJlIHVzZWQgd2l0aCBleHRyYSBjYXJlLlxuICAgICAgICB5YTogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcmV0dXJuIHN0clJlcGxhY2UocywgQU1QLCAnJmFtcDsnKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBGT1IgREVUQUlMUywgcmVmZXIgdG8gaW5IVE1MRGF0YSgpXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVxuICAgICAgICB5ZDogZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJSZXBsYWNlKHMsIExULCAnJmx0OycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEZPUiBERVRBSUxTLCByZWZlciB0byBpbkhUTUxDb21tZW50KClcbiAgICAgICAgLy8gQWxsIE5VTEwgY2hhcmFjdGVycyBpbiBzIGFyZSBmaXJzdCByZXBsYWNlZCB3aXRoIFxcdUZGRkQuXG4gICAgICAgIC8vIElmIHMgY29udGFpbnMgLS0+LCAtLSE+LCBvciBzdGFydHMgd2l0aCAtKj4sIGluc2VydCBhIHNwYWNlIHJpZ2h0IGJlZm9yZSA+IHRvIHN0b3Agc3RhdGUgYnJlYWtpbmcgYXQgPCEtLXt7e3ljIHN9fX0tLT5cbiAgICAgICAgLy8gSWYgcyBlbmRzIHdpdGggLS0hLCAtLSwgb3IgLSwgYXBwZW5kIGEgc3BhY2UgdG8gc3RvcCBjb2xsYWJvcmF0aXZlIHN0YXRlIGJyZWFraW5nIGF0IHt7e3ljIHN9fX0+LCB7e3t5YyBzfX19IT4sIHt7e3ljIHN9fX0tIT4sIHt7e3ljIHN9fX0tPlxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtc3RhdGVcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50LTNcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50XG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cDovL3NoYXp6ZXIuY28udWsvdmVjdG9yL0NoYXJhY3RlcnMtdGhhdC1jbG9zZS1hLUhUTUwtY29tbWVudC0wMDIxXG4gICAgICAgIC8vIElmIHMgY29udGFpbnMgXT4gb3IgZW5kcyB3aXRoIF0sIGFwcGVuZCBhIHNwYWNlIGFmdGVyIF0gaXMgdmVyaWZpZWQgaW4gSUUgdG8gc3RvcCBJRSBjb25kaXRpb25hbCBjb21tZW50cy5cbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1Mzc1MTIlMjh2PXZzLjg1JTI5LmFzcHhcbiAgICAgICAgLy8gV2UgZG8gbm90IGNhcmUgLS1cXHM+LCB3aGljaCBjYW4gcG9zc2libHkgYmUgaW50ZXByZXRlZCBhcyBhIHZhbGlkIGNsb3NlIGNvbW1lbnQgdGFnIGluIHZlcnkgb2xkIGJyb3dzZXJzIChlLmcuLCBmaXJlZm94IDMuNiksIGFzIHNwZWNpZmllZCBpbiB0aGUgaHRtbDQgc3BlY1xuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw0MDEvaW50cm8vc2dtbHR1dC5odG1sI2gtMy4yLjRcbiAgICAgICAgeWM6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyUmVwbGFjZShzLCBTUEVDSUFMX0NPTU1FTlRfQ0hBUlMsIGZ1bmN0aW9uKG0pe1xuICAgICAgICAgICAgICAgIHJldHVybiBtID09PSAnXFx4MDAnID8gJ1xcdUZGRkQnXG4gICAgICAgICAgICAgICAgICAgIDogbSA9PT0gJy0tIScgfHwgbSA9PT0gJy0tJyB8fCBtID09PSAnLScgfHwgbSA9PT0gJ10nID8gbSArICcgJ1xuICAgICAgICAgICAgICAgICAgICA6LypcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ10+JyAgID8gJ10gPidcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJy0tPicgID8gJy0tID4nXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICctLSE+JyA/ICctLSEgPidcbiAgICAgICAgICAgICAgICAgICAgOiAvLSohPz4vLnRlc3QobSkgPyAqLyBtLnNsaWNlKDAsIC0xKSArICcgPic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBGT1IgREVUQUlMUywgcmVmZXIgdG8gaW5Eb3VibGVRdW90ZWRBdHRyKClcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKGRvdWJsZS1xdW90ZWQpLXN0YXRlXG4gICAgICAgIHlhdmQ6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyUmVwbGFjZShzLCBRVU9ULCAnJnF1b3Q7Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gRk9SIERFVEFJTFMsIHJlZmVyIHRvIGluU2luZ2xlUXVvdGVkQXR0cigpXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVxuICAgICAgICB5YXZzOiBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgcmV0dXJuIHN0clJlcGxhY2UocywgU1FVT1QsICcmIzM5OycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEZPUiBERVRBSUxTLCByZWZlciB0byBpblVuUXVvdGVkQXR0cigpXG4gICAgICAgIC8vIFBBUlQgQS5cbiAgICAgICAgLy8gaWYgcyBjb250YWlucyBhbnkgc3RhdGUgYnJlYWtpbmcgY2hhcnMgKFxcdCwgXFxuLCBcXHYsIFxcZiwgXFxyLCBzcGFjZSwgYW5kID4pLFxuICAgICAgICAvLyB0aGV5IGFyZSBlc2NhcGVkIGFuZCBlbmNvZGVkIGludG8gdGhlaXIgZXF1aXZhbGVudCBIVE1MIGVudGl0eSByZXByZXNlbnRhdGlvbnMuIFxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL2RhdGFiYXNlL0FsbC9DaGFyYWN0ZXJzLXdoaWNoLWJyZWFrLWF0dHJpYnV0ZXMtd2l0aG91dC1xdW90ZXNcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKHVucXVvdGVkKS1zdGF0ZVxuICAgICAgICAvL1xuICAgICAgICAvLyBQQVJUIEIuIFxuICAgICAgICAvLyBpZiBzIHN0YXJ0cyB3aXRoICcsIFwiIG9yIGAsIGVuY29kZSBpdCByZXNwLiBhcyAmIzM5OywgJnF1b3Q7LCBvciAmIzk2OyB0byBcbiAgICAgICAgLy8gZW5mb3JjZSB0aGUgYXR0ciB2YWx1ZSAodW5xdW90ZWQpIHN0YXRlXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYmVmb3JlLWF0dHJpYnV0ZS12YWx1ZS1zdGF0ZVxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL3ZlY3Rvci9DaGFyYWN0ZXJzLWFsbG93ZWQtYXR0cmlidXRlLXF1b3RlXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBQQVJUIEMuXG4gICAgICAgIC8vIEluamVjdCBhIFxcdUZGRkQgY2hhcmFjdGVyIGlmIGFuIGVtcHR5IG9yIGFsbCBudWxsIHN0cmluZyBpcyBlbmNvdW50ZXJlZCBpbiBcbiAgICAgICAgLy8gdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlIHN0YXRlLlxuICAgICAgICAvLyBcbiAgICAgICAgLy8gUmF0aW9uYWxlIDE6IG91ciBiZWxpZWYgaXMgdGhhdCBkZXZlbG9wZXJzIHdvdWxkbid0IGV4cGVjdCBhbiBcbiAgICAgICAgLy8gICBlbXB0eSBzdHJpbmcgd291bGQgcmVzdWx0IGluICcgbmFtZT1cInBhc3N3ZFwiJyByZW5kZXJlZCBhcyBcbiAgICAgICAgLy8gICBhdHRyaWJ1dGUgdmFsdWUsIGV2ZW4gdGhvdWdoIHRoaXMgaXMgaG93IEhUTUw1IGlzIHNwZWNpZmllZC5cbiAgICAgICAgLy8gUmF0aW9uYWxlIDI6IGFuIGVtcHR5IG9yIGFsbCBudWxsIHN0cmluZyAoZm9yIElFKSBjYW4gXG4gICAgICAgIC8vICAgZWZmZWN0aXZlbHkgYWx0ZXIgaXRzIGltbWVkaWF0ZSBzdWJzZXF1ZW50IHN0YXRlLCB3ZSBjaG9vc2VcbiAgICAgICAgLy8gICBcXHVGRkZEIHRvIGVuZCB0aGUgdW5xdW90ZWQgYXR0ciBcbiAgICAgICAgLy8gICBzdGF0ZSwgd2hpY2ggdGhlcmVmb3JlIHdpbGwgbm90IG1lc3MgdXAgbGF0ZXIgY29udGV4dHMuXG4gICAgICAgIC8vIFJhdGlvbmFsZSAzOiBTaW5jZSBJRSA2LCBpdCBpcyB2ZXJpZmllZCB0aGF0IE5VTEwgY2hhcnMgYXJlIHN0cmlwcGVkLlxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBFeGFtcGxlOlxuICAgICAgICAvLyA8aW5wdXQgdmFsdWU9e3t7eWF2dSBzfX19IG5hbWU9XCJwYXNzd2RcIi8+XG4gICAgICAgIHlhdnU6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyUmVwbGFjZShzLCBTUEVDSUFMX0FUVFJfVkFMVUVfVU5RVU9URURfQ0hBUlMsIGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0gPT09ICdcXHQnICAgPyAnJiM5OycgIC8vIGluIGhleDogMDlcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ1xcbicgICA/ICcmIzEwOycgLy8gaW4gaGV4OiAwQVxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnXFx4MEInID8gJyYjMTE7JyAvLyBpbiBoZXg6IDBCICBmb3IgSUUuIElFPDkgXFx2IGVxdWFscyB2LCBzbyB1c2UgXFx4MEIgaW5zdGVhZFxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnXFxmJyAgID8gJyYjMTI7JyAvLyBpbiBoZXg6IDBDXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICdcXHInICAgPyAnJiMxMzsnIC8vIGluIGhleDogMERcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJyAnICAgID8gJyYjMzI7JyAvLyBpbiBoZXg6IDIwXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICc9JyAgICA/ICcmIzYxOycgLy8gaW4gaGV4OiAzRFxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnPCcgICAgPyAnJmx0OydcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJz4nICAgID8gJyZndDsnXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICdcIicgICAgPyAnJnF1b3Q7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSBcIidcIiAgICA/ICcmIzM5OydcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ2AnICAgID8gJyYjOTY7J1xuICAgICAgICAgICAgICAgICAgICA6IC8qZW1wdHkgb3IgbnVsbCovICdcXHVGRkZEJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHl1OiBlbmNvZGVVUkksXG4gICAgICAgIHl1YzogZW5jb2RlVVJJQ29tcG9uZW50LFxuXG4gICAgICAgIC8vIE5vdGljZSB0aGF0IHl1YmwgTVVTVCBCRSBBUFBMSUVEIExBU1QsIGFuZCB3aWxsIG5vdCBiZSB1c2VkIGluZGVwZW5kZW50bHkgKGV4cGVjdGVkIG91dHB1dCBmcm9tIGVuY29kZVVSSS9lbmNvZGVVUklDb21wb25lbnQgYW5kIHlhdmQveWF2cy95YXZ1KVxuICAgICAgICAvLyBUaGlzIGlzIHVzZWQgdG8gZGlzYWJsZSBKUyBleGVjdXRpb24gY2FwYWJpbGl0aWVzIGJ5IHByZWZpeGluZyB4LSB0byBeamF2YXNjcmlwdDosIF52YnNjcmlwdDogb3IgXmRhdGE6IHRoYXQgcG9zc2libHkgY291bGQgdHJpZ2dlciBzY3JpcHQgZXhlY3V0aW9uIGluIFVSSSBhdHRyaWJ1dGUgY29udGV4dFxuICAgICAgICB5dWJsOiBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgcmV0dXJuIFVSSV9CTEFDS0xJU1RfUFJPVE9DT0xTW3gueXVwKHMpXSA/ICd4LScgKyBzIDogcztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGlzIGlzIE5PVCBhIHNlY3VyaXR5LWNyaXRpY2FsIGZpbHRlci5cbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlxuICAgICAgICB5dWZ1bGw6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4geC55dShzKS5yZXBsYWNlKFVSTF9JUFY2LCBmdW5jdGlvbihtLCBwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcvL1snICsgcCArICddJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGNoYWluIHl1ZnVsbCgpIHdpdGggeXVibCgpXG4gICAgICAgIHl1YmxmOiBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgcmV0dXJuIHgueXVibCh4Lnl1ZnVsbChzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gVGhlIGRlc2lnbiBwcmluY2lwbGUgb2YgdGhlIENTUyBmaWx0ZXIgTVVTVCBtZWV0IHRoZSBmb2xsb3dpbmcgZ29hbChzKS5cbiAgICAgICAgLy8gKDEpIFRoZSBpbnB1dCBjYW5ub3QgYnJlYWsgb3V0IG9mIHRoZSBjb250ZXh0IChleHByKSBhbmQgdGhpcyBpcyB0byBmdWxmaWxsIHRoZSBqdXN0IHN1ZmZpY2llbnQgZW5jb2RpbmcgcHJpbmNpcGxlLlxuICAgICAgICAvLyAoMikgVGhlIGlucHV0IGNhbm5vdCBpbnRyb2R1Y2UgQ1NTIHBhcnNpbmcgZXJyb3IgYW5kIHRoaXMgaXMgdG8gYWRkcmVzcyB0aGUgY29uY2VybiBvZiBVSSByZWRyZXNzaW5nLlxuICAgICAgICAvL1xuICAgICAgICAvLyB0ZXJtXG4gICAgICAgIC8vICAgOiB1bmFyeV9vcGVyYXRvcj9cbiAgICAgICAgLy8gICAgIFsgTlVNQkVSIFMqIHwgUEVSQ0VOVEFHRSBTKiB8IExFTkdUSCBTKiB8IEVNUyBTKiB8IEVYUyBTKiB8IEFOR0xFIFMqIHxcbiAgICAgICAgLy8gICAgIFRJTUUgUyogfCBGUkVRIFMqIF1cbiAgICAgICAgLy8gICB8IFNUUklORyBTKiB8IElERU5UIFMqIHwgVVJJIFMqIHwgaGV4Y29sb3IgfCBmdW5jdGlvblxuICAgICAgICAvLyBcbiAgICAgICAgLy8gUmVmZXJlbmNlOlxuICAgICAgICAvLyAqIGh0dHA6Ly93d3cudzMub3JnL1RSL0NTUzIxL2dyYW1tYXIuaHRtbCBcbiAgICAgICAgLy8gKiBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3Mtc3ludGF4LTMvXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBOT1RFOiBkZWxpbWl0ZXIgaW4gQ1NTIC0gIFxcICBfICA6ICA7ICAoICApICBcIiAgJyAgLyAgLCAgJSAgIyAgISAgKiAgQCAgLiAgeyAgfVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIDJkIDVjIDVmIDNhIDNiIDI4IDI5IDIyIDI3IDJmIDJjIDI1IDIzIDIxIDJhIDQwIDJlIDdiIDdkXG5cbiAgICAgICAgeWNldTogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcyA9IGh0bWxEZWNvZGUocyk7XG4gICAgICAgICAgICByZXR1cm4gQ1NTX1ZBTElEX1ZBTFVFLnRlc3QocykgPyBzIDogXCI7LXg6J1wiICsgY3NzQmxhY2tsaXN0KHMucmVwbGFjZShDU1NfU0lOR0xFX1FVT1RFRF9DSEFSUywgY3NzRW5jb2RlKSkgKyBcIic7LXY6XCI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gc3RyaW5nMSA9IFxcXCIoW15cXG5cXHJcXGZcXFxcXCJdfFxcXFx7bmx9fFxcXFxbXlxcblxcclxcZjAtOWEtZl18XFxcXFswLTlhLWZdezEsNn0oXFxyXFxufFsgXFxuXFxyXFx0XFxmXSk/KSpcXFwiXG4gICAgICAgIHljZWQ6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBjc3NCbGFja2xpc3QoaHRtbERlY29kZShzKS5yZXBsYWNlKENTU19ET1VCTEVfUVVPVEVEX0NIQVJTLCBjc3NFbmNvZGUpKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBzdHJpbmcyID0gXFwnKFteXFxuXFxyXFxmXFxcXCddfFxcXFx7bmx9fFxcXFxbXlxcblxcclxcZjAtOWEtZl18XFxcXFswLTlhLWZdezEsNn0oXFxyXFxufFsgXFxuXFxyXFx0XFxmXSk/KSpcXCdcbiAgICAgICAgeWNlczogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcmV0dXJuIGNzc0JsYWNrbGlzdChodG1sRGVjb2RlKHMpLnJlcGxhY2UoQ1NTX1NJTkdMRV9RVU9URURfQ0hBUlMsIGNzc0VuY29kZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZvciB1cmwoe3t7eWNldXUgdXJsfX19XG4gICAgICAgIC8vIHVucXVvdGVkX3VybCA9IChbISMkJSYqLX5dfFxcXFx7aH17MSw2fShcXHJcXG58WyBcXHRcXHJcXG5cXGZdKT98XFxcXFteXFxyXFxuXFxmMC05YS1mXSkqIChDU1MgMi4xIGRlZmluaXRpb24pXG4gICAgICAgIC8vIHVucXVvdGVkX3VybCA9IChbXlwiJygpXFxcXCBcXHRcXG5cXHJcXGZcXHZcXHUwMDAwXFx1MDAwOFxcdTAwMGJcXHUwMDBlLVxcdTAwMWZcXHUwMDdmXXxcXFxce2h9ezEsNn0oXFxyXFxufFsgXFx0XFxyXFxuXFxmXSk/fFxcXFxbXlxcclxcblxcZjAtOWEtZl0pKiAoQ1NTIDMuMCBkZWZpbml0aW9uKVxuICAgICAgICAvLyBUaGUgc3RhdGUgbWFjaGluZSBpbiBDU1MgMy4wIGlzIG1vcmUgd2VsbCBkZWZpbmVkIC0gaHR0cDovL3d3dy53My5vcmcvVFIvY3NzLXN5bnRheC0zLyNjb25zdW1lLWEtdXJsLXRva2VuMFxuICAgICAgICAvLyBDU1NfVU5RVU9URURfVVJMID0gL1snXFwoXFwpXS9nOyAvLyBcIiBcXCB0cmVhdGVkIGJ5IGVuY29kZVVSSSgpICAgXG4gICAgICAgIHljZXV1OiBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICByZXR1cm4gY3NzVXJsKHMpLnJlcGxhY2UoQ1NTX1VOUVVPVEVEX1VSTCwgZnVuY3Rpb24gKGNocikge1xuICAgICAgICAgICAgICAgIHJldHVybiAgY2hyID09PSAnXFwnJyAgICAgICAgPyAnXFxcXDI3ICcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hyID09PSAnKCcgICAgICAgICA/ICclMjgnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGNociA9PT0gJyknID8gKi8gICAnJTI5JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZvciB1cmwoXCJ7e3t5Y2V1ZCB1cmx9fX1cbiAgICAgICAgeWNldWQ6IGZ1bmN0aW9uKHMpIHsgXG4gICAgICAgICAgICByZXR1cm4gY3NzVXJsKHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZvciB1cmwoJ3t7e3ljZXVzIHVybH19fVxuICAgICAgICB5Y2V1czogZnVuY3Rpb24ocykgeyBcbiAgICAgICAgICAgIHJldHVybiBjc3NVcmwocykucmVwbGFjZShTUVVPVCwgJ1xcXFwyNyAnKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLy8gZXhwb3NpbmcgcHJpdkZpbHRlcnNcbi8vIHRoaXMgaXMgYW4gdW5kb2N1bWVudGVkIGZlYXR1cmUsIGFuZCBwbGVhc2UgdXNlIGl0IHdpdGggZXh0cmEgY2FyZVxudmFyIHByaXZGaWx0ZXJzID0gZXhwb3J0cy5fcHJpdkZpbHRlcnMgPSBleHBvcnRzLl9nZXRQcml2RmlsdGVycygpO1xuXG5cbi8qIGNoYWluaW5nIGZpbHRlcnMgKi9cblxuLy8gdXJpSW5BdHRyIGFuZCBsaXRlcmFsbHkgdXJpUGF0aEluQXR0clxuLy8geXVibCBpcyBhbHdheXMgdXNlZCBcbi8vIFJhdGlvbmFsZTogZ2l2ZW4gcGF0dGVybiBsaWtlIHRoaXM6IDxhIGhyZWY9XCJ7e3t1cmlQYXRoSW5Eb3VibGVRdW90ZWRBdHRyIHN9fX1cIj5cbi8vICAgICAgICAgICAgZGV2ZWxvcGVyIG1heSBleHBlY3QgcyBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCA/IG9yIC8sIGJ1dCBhbiBhdHRhY2tlciBjYW4gYWJ1c2UgaXQgd2l0aCAnamF2YXNjcmlwdDphbGVydCgxKSdcbmZ1bmN0aW9uIHVyaUluQXR0ciAocywgeWF2LCB5dSkge1xuICAgIHJldHVybiBwcml2RmlsdGVycy55dWJsKHlhdigoeXUgfHwgcHJpdkZpbHRlcnMueXVmdWxsKShzKSkpO1xufVxuXG4vKiogXG4qIFlhaG9vIFNlY3VyZSBYU1MgRmlsdGVycyAtIGp1c3Qgc3VmZmljaWVudCBvdXRwdXQgZmlsdGVyaW5nIHRvIHByZXZlbnQgWFNTIVxuKiBAbW9kdWxlIHhzcy1maWx0ZXJzIFxuKi9cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjaW5IVE1MRGF0YVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyB3aXRoICc8JyBlbmNvZGVkIGFzICcmYW1wO2x0OydcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIERhdGEgY29udGV4dCB0byBlbmNvZGUgYWxsICc8JyBjaGFyYWN0ZXJzIGludG8gJyZhbXA7bHQ7J1xuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVwiPkhUTUw1IERhdGEgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGRpdj57e3tpbkhUTUxEYXRhIGh0bWxEYXRhfX19PC9kaXY+XG4qXG4qL1xuZXhwb3J0cy5pbkhUTUxEYXRhID0gcHJpdkZpbHRlcnMueWQ7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI2luSFRNTENvbW1lbnRcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dFxuKiBAcmV0dXJucyB7c3RyaW5nfSBBbGwgTlVMTCBjaGFyYWN0ZXJzIGluIHMgYXJlIGZpcnN0IHJlcGxhY2VkIHdpdGggXFx1RkZGRC4gSWYgcyBjb250YWlucyAtLT4sIC0tIT4sIG9yIHN0YXJ0cyB3aXRoIC0qPiwgaW5zZXJ0IGEgc3BhY2UgcmlnaHQgYmVmb3JlID4gdG8gc3RvcCBzdGF0ZSBicmVha2luZyBhdCA8IS0te3t7eWMgc319fS0tPi4gSWYgcyBlbmRzIHdpdGggLS0hLCAtLSwgb3IgLSwgYXBwZW5kIGEgc3BhY2UgdG8gc3RvcCBjb2xsYWJvcmF0aXZlIHN0YXRlIGJyZWFraW5nIGF0IHt7e3ljIHN9fX0+LCB7e3t5YyBzfX19IT4sIHt7e3ljIHN9fX0tIT4sIHt7e3ljIHN9fX0tPi4gSWYgcyBjb250YWlucyBdPiBvciBlbmRzIHdpdGggXSwgYXBwZW5kIGEgc3BhY2UgYWZ0ZXIgXSBpcyB2ZXJpZmllZCBpbiBJRSB0byBzdG9wIElFIGNvbmRpdGlvbmFsIGNvbW1lbnRzLlxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQ29tbWVudCBjb250ZXh0XG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50LTNcIj5TaGF6emVyIC0gQ2xvc2luZyBjb21tZW50cyBmb3IgLS4tPjwvYT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50XCI+U2hhenplciAtIENsb3NpbmcgY29tbWVudHMgZm9yIC0tLj48L2E+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3NoYXp6ZXIuY28udWsvdmVjdG9yL0NoYXJhY3RlcnMtdGhhdC1jbG9zZS1hLUhUTUwtY29tbWVudC0wMDIxXCI+U2hhenplciAtIENsb3NpbmcgY29tbWVudHMgZm9yIC4+PC9hPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtc3RhcnQtc3RhdGVcIj5IVE1MNSBDb21tZW50IFN0YXJ0IFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGFydC1kYXNoLXN0YXRlXCI+SFRNTDUgQ29tbWVudCBTdGFydCBEYXNoIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGF0ZVwiPkhUTUw1IENvbW1lbnQgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LWVuZC1kYXNoLXN0YXRlXCI+SFRNTDUgQ29tbWVudCBFbmQgRGFzaCBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtZW5kLXN0YXRlXCI+SFRNTDUgQ29tbWVudCBFbmQgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LWVuZC1iYW5nLXN0YXRlXCI+SFRNTDUgQ29tbWVudCBFbmQgQmFuZyBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzNzUxMiUyOHY9dnMuODUlMjkuYXNweFwiPkNvbmRpdGlvbmFsIENvbW1lbnRzIGluIEludGVybmV0IEV4cGxvcmVyPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDwhLS0ge3t7aW5IVE1MQ29tbWVudCBodG1sX2NvbW1lbnR9fX0gLS0+XG4qXG4qL1xuZXhwb3J0cy5pbkhUTUxDb21tZW50ID0gcHJpdkZpbHRlcnMueWM7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI2luU2luZ2xlUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyB3aXRoIGFueSBzaW5nbGUtcXVvdGUgY2hhcmFjdGVycyBlbmNvZGVkIGludG8gJyZhbXA7JiMzOTsnLlxuKlxuKiBAZGVzY3JpcHRpb25cbiogPHAgY2xhc3M9XCJ3YXJuaW5nXCI+V2FybmluZzogVGhpcyBpcyBOT1QgZGVzaWduZWQgZm9yIGFueSBvblggKGUuZy4sIG9uY2xpY2spIGF0dHJpYnV0ZXMhPC9wPlxuKiA8cCBjbGFzcz1cIndhcm5pbmdcIj5XYXJuaW5nOiBJZiB5b3UncmUgd29ya2luZyBvbiBVUkkvY29tcG9uZW50cywgdXNlIHRoZSBtb3JlIHNwZWNpZmljIHVyaV9fX0luU2luZ2xlUXVvdGVkQXR0ciBmaWx0ZXIgPC9wPlxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKHNpbmdsZS1xdW90ZWQpIHN0YXRlIHRvIGVuY29kZSBhbGwgc2luZ2xlLXF1b3RlIGNoYXJhY3RlcnMgaW50byAnJmFtcDsmIzM5OydcbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oc2luZ2xlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFNpbmdsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxpbnB1dCBuYW1lPSdmaXJzdG5hbWUnIHZhbHVlPSd7e3tpblNpbmdsZVF1b3RlZEF0dHIgZmlyc3RuYW1lfX19JyAvPlxuKlxuKi9cbmV4cG9ydHMuaW5TaW5nbGVRdW90ZWRBdHRyID0gcHJpdkZpbHRlcnMueWF2cztcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjaW5Eb3VibGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIHdpdGggYW55IHNpbmdsZS1xdW90ZSBjaGFyYWN0ZXJzIGVuY29kZWQgaW50byAnJmFtcDsmcXVvdDsnLlxuKlxuKiBAZGVzY3JpcHRpb25cbiogPHAgY2xhc3M9XCJ3YXJuaW5nXCI+V2FybmluZzogVGhpcyBpcyBOT1QgZGVzaWduZWQgZm9yIGFueSBvblggKGUuZy4sIG9uY2xpY2spIGF0dHJpYnV0ZXMhPC9wPlxuKiA8cCBjbGFzcz1cIndhcm5pbmdcIj5XYXJuaW5nOiBJZiB5b3UncmUgd29ya2luZyBvbiBVUkkvY29tcG9uZW50cywgdXNlIHRoZSBtb3JlIHNwZWNpZmljIHVyaV9fX0luRG91YmxlUXVvdGVkQXR0ciBmaWx0ZXIgPC9wPlxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKGRvdWJsZS1xdW90ZWQpIHN0YXRlIHRvIGVuY29kZSBhbGwgc2luZ2xlLXF1b3RlIGNoYXJhY3RlcnMgaW50byAnJmFtcDsmcXVvdDsnXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKGRvdWJsZS1xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChEb3VibGUtUXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8aW5wdXQgbmFtZT1cImZpcnN0bmFtZVwiIHZhbHVlPVwie3t7aW5Eb3VibGVRdW90ZWRBdHRyIGZpcnN0bmFtZX19fVwiIC8+XG4qXG4qL1xuZXhwb3J0cy5pbkRvdWJsZVF1b3RlZEF0dHIgPSBwcml2RmlsdGVycy55YXZkO1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyNpblVuUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4qIEByZXR1cm5zIHtzdHJpbmd9IElmIHMgY29udGFpbnMgYW55IHN0YXRlIGJyZWFraW5nIGNoYXJzIChcXHQsIFxcbiwgXFx2LCBcXGYsIFxcciwgc3BhY2UsIG51bGwsICcsIFwiLCBgLCA8LCA+LCBhbmQgPSksIHRoZXkgYXJlIGVzY2FwZWQgYW5kIGVuY29kZWQgaW50byB0aGVpciBlcXVpdmFsZW50IEhUTUwgZW50aXR5IHJlcHJlc2VudGF0aW9ucy4gSWYgdGhlIHN0cmluZyBpcyBlbXB0eSwgaW5qZWN0IGEgXFx1RkZGRCBjaGFyYWN0ZXIuXG4qXG4qIEBkZXNjcmlwdGlvblxuKiA8cCBjbGFzcz1cIndhcm5pbmdcIj5XYXJuaW5nOiBUaGlzIGlzIE5PVCBkZXNpZ25lZCBmb3IgYW55IG9uWCAoZS5nLiwgb25jbGljaykgYXR0cmlidXRlcyE8L3A+XG4qIDxwIGNsYXNzPVwid2FybmluZ1wiPldhcm5pbmc6IElmIHlvdSdyZSB3b3JraW5nIG9uIFVSSS9jb21wb25lbnRzLCB1c2UgdGhlIG1vcmUgc3BlY2lmaWMgdXJpX19fSW5VblF1b3RlZEF0dHIgZmlsdGVyIDwvcD5cbiogPHA+UmVnYXJkaW5nIFxcdUZGRkQgaW5qZWN0aW9uLCBnaXZlbiA8YSBpZD17e3tpZH19fSBuYW1lPVwicGFzc3dkXCI+LDxici8+XG4qICAgICAgICBSYXRpb25hbGUgMTogb3VyIGJlbGllZiBpcyB0aGF0IGRldmVsb3BlcnMgd291bGRuJ3QgZXhwZWN0IHdoZW4gaWQgZXF1YWxzIGFuXG4qICAgICAgICAgIGVtcHR5IHN0cmluZyB3b3VsZCByZXN1bHQgaW4gJyBuYW1lPVwicGFzc3dkXCInIHJlbmRlcmVkIGFzIFxuKiAgICAgICAgICBhdHRyaWJ1dGUgdmFsdWUsIGV2ZW4gdGhvdWdoIHRoaXMgaXMgaG93IEhUTUw1IGlzIHNwZWNpZmllZC48YnIvPlxuKiAgICAgICAgUmF0aW9uYWxlIDI6IGFuIGVtcHR5IG9yIGFsbCBudWxsIHN0cmluZyAoZm9yIElFKSBjYW4gXG4qICAgICAgICAgIGVmZmVjdGl2ZWx5IGFsdGVyIGl0cyBpbW1lZGlhdGUgc3Vic2VxdWVudCBzdGF0ZSwgd2UgY2hvb3NlXG4qICAgICAgICAgIFxcdUZGRkQgdG8gZW5kIHRoZSB1bnF1b3RlZCBhdHRyIFxuKiAgICAgICAgICBzdGF0ZSwgd2hpY2ggdGhlcmVmb3JlIHdpbGwgbm90IG1lc3MgdXAgbGF0ZXIgY29udGV4dHMuPGJyLz5cbiogICAgICAgIFJhdGlvbmFsZSAzOiBTaW5jZSBJRSA2LCBpdCBpcyB2ZXJpZmllZCB0aGF0IE5VTEwgY2hhcnMgYXJlIHN0cmlwcGVkLjxici8+XG4qICAgICAgICBSZWZlcmVuY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlPC9wPlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFVucXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2JlZm9yZS1hdHRyaWJ1dGUtdmFsdWUtc3RhdGVcIj5IVE1MNSBCZWZvcmUgQXR0cmlidXRlIFZhbHVlIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3NoYXp6ZXIuY28udWsvZGF0YWJhc2UvQWxsL0NoYXJhY3RlcnMtd2hpY2gtYnJlYWstYXR0cmlidXRlcy13aXRob3V0LXF1b3Rlc1wiPlNoYXp6ZXIgLSBDaGFyYWN0ZXJzLXdoaWNoLWJyZWFrLWF0dHJpYnV0ZXMtd2l0aG91dC1xdW90ZXM8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy1hbGxvd2VkLWF0dHJpYnV0ZS1xdW90ZVwiPlNoYXp6ZXIgLSBDaGFyYWN0ZXJzLWFsbG93ZWQtYXR0cmlidXRlLXF1b3RlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxpbnB1dCBuYW1lPVwiZmlyc3RuYW1lXCIgdmFsdWU9e3t7aW5VblF1b3RlZEF0dHIgZmlyc3RuYW1lfX19IC8+XG4qXG4qL1xuZXhwb3J0cy5pblVuUXVvdGVkQXR0ciA9IHByaXZGaWx0ZXJzLnlhdnU7XG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpSW5TaW5nbGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSSgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChzaW5nbGUtcXVvdGVkKSBzdGF0ZSBmb3IgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUkkuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3Qgd2luZG93LmVuY29kZVVSSSgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiA8cD5Ob3RpY2U6IFRoaXMgZmlsdGVyIGlzIElQdjYgZnJpZW5kbHkgYnkgbm90IGVuY29kaW5nICdbJyBhbmQgJ10nLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oc2luZ2xlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFNpbmdsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9J3t7e3VyaUluU2luZ2xlUXVvdGVkQXR0ciBmdWxsX3VyaX19fSc+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlJblNpbmdsZVF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiB1cmlJbkF0dHIocywgcHJpdkZpbHRlcnMueWF2cyk7XG59O1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlJbkRvdWJsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhbiA8c3Ryb25nPmFic29sdXRlPC9zdHJvbmc+IFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKGRvdWJsZS1xdW90ZWQpIHN0YXRlIGZvciBhbiA8c3Ryb25nPmFic29sdXRlPC9zdHJvbmc+IFVSSS48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIDxwPk5vdGljZTogVGhpcyBmaWx0ZXIgaXMgSVB2NiBmcmllbmRseSBieSBub3QgZW5jb2RpbmcgJ1snIGFuZCAnXScuPC9wPlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShkb3VibGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoRG91YmxlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1cInt7e3VyaUluRG91YmxlUXVvdGVkQXR0ciBmdWxsX3VyaX19fVwiPmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpSW5Eb3VibGVRdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gdXJpSW5BdHRyKHMsIHByaXZGaWx0ZXJzLnlhdmQpO1xufTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlJblVuUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlICh1bnF1b3RlZCkgc3RhdGUgZm9yIGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJLjxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHRoZSBidWlsdC1pbiBlbmNvZGVVUkkoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiA8cD5Ob3RpY2U6IFRoaXMgZmlsdGVyIGlzIElQdjYgZnJpZW5kbHkgYnkgbm90IGVuY29kaW5nICdbJyBhbmQgJ10nLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChVbnF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj17e3t1cmlJblVuUXVvdGVkQXR0ciBmdWxsX3VyaX19fT5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUluVW5RdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gdXJpSW5BdHRyKHMsIHByaXZGaWx0ZXJzLnlhdnUpO1xufTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpSW5IVE1MRGF0YVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSBhbmQgdGhlbiBpbkhUTUxEYXRhKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIERhdGEgc3RhdGUgZm9yIGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJLlxuKlxuKiA8cD5Ob3RpY2U6IFRoZSBhY3R1YWwgaW1wbGVtZW50YXRpb24gc2tpcHMgaW5IVE1MRGF0YSgpLCBzaW5jZSAnPCcgaXMgYWxyZWFkeSBlbmNvZGVkIGFzICclM0MnIGJ5IGVuY29kZVVSSSgpLjwvcD5cbiogPHA+Tm90aWNlOiBUaGlzIGZpbHRlciBpcyBJUHY2IGZyaWVuZGx5IGJ5IG5vdCBlbmNvZGluZyAnWycgYW5kICddJy48L3A+XG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklcIj5lbmNvZGVVUkkgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNkYXRhLXN0YXRlXCI+SFRNTDUgRGF0YSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPVwiL3NvbWV3aGVyZVwiPnt7e3VyaUluSFRNTERhdGEgZnVsbF91cml9fX08L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpSW5IVE1MRGF0YSA9IHByaXZGaWx0ZXJzLnl1ZnVsbDtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlJbkhUTUxDb21tZW50XG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgYnkgd2luZG93LmVuY29kZVVSSSgpLCBhbmQgZmluYWxseSBpbkhUTUxDb21tZW50KClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIENvbW1lbnQgc3RhdGUgZm9yIGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJLlxuKlxuKiA8cD5Ob3RpY2U6IFRoaXMgZmlsdGVyIGlzIElQdjYgZnJpZW5kbHkgYnkgbm90IGVuY29kaW5nICdbJyBhbmQgJ10nLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2RhdGEtc3RhdGVcIj5IVE1MNSBEYXRhIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGF0ZVwiPkhUTUw1IENvbW1lbnQgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPCEtLSB7e3t1cmlJbkhUTUxDb21tZW50IGZ1bGxfdXJpfX19IC0tPlxuKiBcbiovXG5leHBvcnRzLnVyaUluSFRNTENvbW1lbnQgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBwcml2RmlsdGVycy55Yyhwcml2RmlsdGVycy55dWZ1bGwocykpO1xufTtcblxuXG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluU2luZ2xlUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpblNpbmdsZVF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAoc2luZ2xlLXF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJLjxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpblNpbmdsZVF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oc2luZ2xlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFNpbmdsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9J2h0dHA6Ly9leGFtcGxlLmNvbS97e3t1cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyIHVyaV9wYXRofX19Jz5saW5rPC9hPlxuKiA8YSBocmVmPSdodHRwOi8vZXhhbXBsZS5jb20vP3t7e3VyaVF1ZXJ5SW5TaW5nbGVRdW90ZWRBdHRyIHVyaV9xdWVyeX19fSc+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gdXJpSW5BdHRyKHMsIHByaXZGaWx0ZXJzLnlhdnMsIHByaXZGaWx0ZXJzLnl1KTtcbn07XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKGRvdWJsZS1xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSS48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklcIj5lbmNvZGVVUkkgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKGRvdWJsZS1xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChEb3VibGUtUXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tL3t7e3VyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHIgdXJpX3BhdGh9fX1cIj5saW5rPC9hPlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tLz97e3t1cmlRdWVyeUluRG91YmxlUXVvdGVkQXR0ciB1cmlfcXVlcnl9fX1cIj5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiB1cmlJbkF0dHIocywgcHJpdkZpbHRlcnMueWF2ZCwgcHJpdkZpbHRlcnMueXUpO1xufTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5VblF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5VblF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAodW5xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSS48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB0aGUgYnVpbHQtaW4gZW5jb2RlVVJJKCksIHRoZW4gaW5VblF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChVbnF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1odHRwOi8vZXhhbXBsZS5jb20ve3t7dXJpUGF0aEluVW5RdW90ZWRBdHRyIHVyaV9wYXRofX19Pmxpbms8L2E+XG4qIDxhIGhyZWY9aHR0cDovL2V4YW1wbGUuY29tLz97e3t1cmlRdWVyeUluVW5RdW90ZWRBdHRyIHVyaV9xdWVyeX19fT5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaVBhdGhJblVuUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHVyaUluQXR0cihzLCBwcml2RmlsdGVycy55YXZ1LCBwcml2RmlsdGVycy55dSk7XG59O1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5IVE1MRGF0YVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSBhbmQgdGhlbiBpbkhUTUxEYXRhKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIERhdGEgc3RhdGUgZm9yIGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJLlxuKlxuKiA8cD5Ob3RpY2U6IFRoZSBhY3R1YWwgaW1wbGVtZW50YXRpb24gc2tpcHMgaW5IVE1MRGF0YSgpLCBzaW5jZSAnPCcgaXMgYWxyZWFkeSBlbmNvZGVkIGFzICclM0MnIGJ5IGVuY29kZVVSSSgpLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2RhdGEtc3RhdGVcIj5IVE1MNSBEYXRhIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9XCJodHRwOi8vZXhhbXBsZS5jb20vXCI+aHR0cDovL2V4YW1wbGUuY29tL3t7e3VyaVBhdGhJbkhUTUxEYXRhIHVyaV9wYXRofX19PC9hPlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tL1wiPmh0dHA6Ly9leGFtcGxlLmNvbS8/e3t7dXJpUXVlcnlJbkhUTUxEYXRhIHVyaV9xdWVyeX19fTwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlQYXRoSW5IVE1MRGF0YSA9IHByaXZGaWx0ZXJzLnl1O1xuXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkhUTUxDb21tZW50XG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgUGF0aC9RdWVyeSBvciByZWxhdGl2ZSBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgYnkgd2luZG93LmVuY29kZVVSSSgpLCBhbmQgZmluYWxseSBpbkhUTUxDb21tZW50KClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIENvbW1lbnQgc3RhdGUgZm9yIGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJLlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVwiPkhUTUw1IERhdGEgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LXN0YXRlXCI+SFRNTDUgQ29tbWVudCBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8IS0tIGh0dHA6Ly9leGFtcGxlLmNvbS97e3t1cmlQYXRoSW5IVE1MQ29tbWVudCB1cmlfcGF0aH19fSAtLT5cbiogPCEtLSBodHRwOi8vZXhhbXBsZS5jb20vP3t7e3VyaVF1ZXJ5SW5IVE1MQ29tbWVudCB1cmlfcXVlcnl9fX0gLS0+XG4qL1xuZXhwb3J0cy51cmlQYXRoSW5IVE1MQ29tbWVudCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnljKHByaXZGaWx0ZXJzLnl1KHMpKTtcbn07XG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJblNpbmdsZVF1b3RlZEF0dHJcbiogQGRlc2NyaXB0aW9uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyXG4qL1xuZXhwb3J0cy51cmlRdWVyeUluU2luZ2xlUXVvdGVkQXR0ciA9IGV4cG9ydHMudXJpUGF0aEluU2luZ2xlUXVvdGVkQXR0cjtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJbkRvdWJsZVF1b3RlZEF0dHJcbiogQGRlc2NyaXB0aW9uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5Eb3VibGVRdW90ZWRBdHRyfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5Eb3VibGVRdW90ZWRBdHRyXG4qL1xuZXhwb3J0cy51cmlRdWVyeUluRG91YmxlUXVvdGVkQXR0ciA9IGV4cG9ydHMudXJpUGF0aEluRG91YmxlUXVvdGVkQXR0cjtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJblVuUXVvdGVkQXR0clxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJblVuUXVvdGVkQXR0cn1cbiogXG4qIEBhbGlhcyBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluVW5RdW90ZWRBdHRyXG4qL1xuZXhwb3J0cy51cmlRdWVyeUluVW5RdW90ZWRBdHRyID0gZXhwb3J0cy51cmlQYXRoSW5VblF1b3RlZEF0dHI7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVF1ZXJ5SW5IVE1MRGF0YVxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkhUTUxEYXRhfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5IVE1MRGF0YVxuKi9cbmV4cG9ydHMudXJpUXVlcnlJbkhUTUxEYXRhID0gZXhwb3J0cy51cmlQYXRoSW5IVE1MRGF0YTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJbkhUTUxDb21tZW50XG4qIEBkZXNjcmlwdGlvbiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluSFRNTENvbW1lbnR9XG4qIFxuKiBAYWxpYXMgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkhUTUxDb21tZW50XG4qL1xuZXhwb3J0cy51cmlRdWVyeUluSFRNTENvbW1lbnQgPSBleHBvcnRzLnVyaVBhdGhJbkhUTUxDb21tZW50O1xuXG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5TaW5nbGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgQ29tcG9uZW50XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpblNpbmdsZVF1b3RlZEF0dHIoKVxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChzaW5nbGUtcXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgQ29tcG9uZW50Ljxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpblNpbmdsZVF1b3RlZEF0dHIoKVxuKlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoU2luZ2xlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj0naHR0cDovL2V4YW1wbGUuY29tLz9xPXt7e3VyaUNvbXBvbmVudEluU2luZ2xlUXVvdGVkQXR0ciB1cmlfY29tcG9uZW50fX19Jz5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUNvbXBvbmVudEluU2luZ2xlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnlhdnMocHJpdkZpbHRlcnMueXVjKHMpKTtcbn07XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluRG91YmxlUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIENvbXBvbmVudFxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAoZG91YmxlLXF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIENvbXBvbmVudC48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKClcbipcbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSUNvbXBvbmVudFwiPmVuY29kZVVSSUNvbXBvbmVudCB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oZG91YmxlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKERvdWJsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9XCJodHRwOi8vZXhhbXBsZS5jb20vP3E9e3t7dXJpQ29tcG9uZW50SW5Eb3VibGVRdW90ZWRBdHRyIHVyaV9jb21wb25lbnR9fX1cIj5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUNvbXBvbmVudEluRG91YmxlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnlhdmQocHJpdkZpbHRlcnMueXVjKHMpKTtcbn07XG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5VblF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBDb21wb25lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluVW5RdW90ZWRBdHRyKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAodW5xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBDb21wb25lbnQuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3QgdGhlIGJ1aWx0LWluIGVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluVW5RdW90ZWRBdHRyKClcbipcbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSUNvbXBvbmVudFwiPmVuY29kZVVSSUNvbXBvbmVudCB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChVbnF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1odHRwOi8vZXhhbXBsZS5jb20vP3E9e3t7dXJpQ29tcG9uZW50SW5VblF1b3RlZEF0dHIgdXJpX2NvbXBvbmVudH19fT5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUNvbXBvbmVudEluVW5RdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueWF2dShwcml2RmlsdGVycy55dWMocykpO1xufTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5IVE1MRGF0YVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIENvbXBvbmVudFxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBieSB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCkgYW5kIHRoZW4gaW5IVE1MRGF0YSgpXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBEYXRhIHN0YXRlIGZvciBhIFVSSSBDb21wb25lbnQuXG4qXG4qIDxwPk5vdGljZTogVGhlIGFjdHVhbCBpbXBsZW1lbnRhdGlvbiBza2lwcyBpbkhUTUxEYXRhKCksIHNpbmNlICc8JyBpcyBhbHJlYWR5IGVuY29kZWQgYXMgJyUzQycgYnkgZW5jb2RlVVJJQ29tcG9uZW50KCkuPC9wPlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVwiPkhUTUw1IERhdGEgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1cImh0dHA6Ly9leGFtcGxlLmNvbS9cIj5odHRwOi8vZXhhbXBsZS5jb20vP3E9e3t7dXJpQ29tcG9uZW50SW5IVE1MRGF0YSB1cmlfY29tcG9uZW50fX19PC9hPlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tL1wiPmh0dHA6Ly9leGFtcGxlLmNvbS8je3t7dXJpQ29tcG9uZW50SW5IVE1MRGF0YSB1cmlfZnJhZ21lbnR9fX08L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpQ29tcG9uZW50SW5IVE1MRGF0YSA9IHByaXZGaWx0ZXJzLnl1YztcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJbkhUTUxDb21tZW50XG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgQ29tcG9uZW50XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGJ5IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgYW5kIGZpbmFsbHkgaW5IVE1MQ29tbWVudCgpXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBDb21tZW50IHN0YXRlIGZvciBhIFVSSSBDb21wb25lbnQuXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcIj5lbmNvZGVVUklDb21wb25lbnQgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNkYXRhLXN0YXRlXCI+SFRNTDUgRGF0YSBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtc3RhdGVcIj5IVE1MNSBDb21tZW50IFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDwhLS0gaHR0cDovL2V4YW1wbGUuY29tLz9xPXt7e3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnQgdXJpX2NvbXBvbmVudH19fSAtLT5cbiogPCEtLSBodHRwOi8vZXhhbXBsZS5jb20vI3t7e3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnQgdXJpX2ZyYWdtZW50fX19IC0tPlxuKi9cbmV4cG9ydHMudXJpQ29tcG9uZW50SW5IVE1MQ29tbWVudCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnljKHByaXZGaWx0ZXJzLnl1YyhzKSk7XG59O1xuXG5cbi8vIHVyaUZyYWdtZW50SW5TaW5nbGVRdW90ZWRBdHRyXG4vLyBhZGRlZCB5dWJsIG9uIHRvcCBvZiB1cmlDb21wb25lbnRJbkF0dHIgXG4vLyBSYXRpb25hbGU6IGdpdmVuIHBhdHRlcm4gbGlrZSB0aGlzOiA8YSBocmVmPSd7e3t1cmlGcmFnbWVudEluU2luZ2xlUXVvdGVkQXR0ciBzfX19Jz5cbi8vICAgICAgICAgICAgZGV2ZWxvcGVyIG1heSBleHBlY3QgcyBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCAjLCBidXQgYW4gYXR0YWNrZXIgY2FuIGFidXNlIGl0IHdpdGggJ2phdmFzY3JpcHQ6YWxlcnQoMSknXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUZyYWdtZW50SW5TaW5nbGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgRnJhZ21lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChzaW5nbGUtcXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgRnJhZ21lbnQuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3Qgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoU2luZ2xlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj0naHR0cDovL2V4YW1wbGUuY29tLyN7e3t1cmlGcmFnbWVudEluU2luZ2xlUXVvdGVkQXR0ciB1cmlfZnJhZ21lbnR9fX0nPmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpRnJhZ21lbnRJblNpbmdsZVF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBwcml2RmlsdGVycy55dWJsKHByaXZGaWx0ZXJzLnlhdnMocHJpdkZpbHRlcnMueXVjKHMpKSk7XG59O1xuXG4vLyB1cmlGcmFnbWVudEluRG91YmxlUXVvdGVkQXR0clxuLy8gYWRkZWQgeXVibCBvbiB0b3Agb2YgdXJpQ29tcG9uZW50SW5BdHRyIFxuLy8gUmF0aW9uYWxlOiBnaXZlbiBwYXR0ZXJuIGxpa2UgdGhpczogPGEgaHJlZj1cInt7e3VyaUZyYWdtZW50SW5Eb3VibGVRdW90ZWRBdHRyIHN9fX1cIj5cbi8vICAgICAgICAgICAgZGV2ZWxvcGVyIG1heSBleHBlY3QgcyBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCAjLCBidXQgYW4gYXR0YWNrZXIgY2FuIGFidXNlIGl0IHdpdGggJ2phdmFzY3JpcHQ6YWxlcnQoMSknXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUZyYWdtZW50SW5Eb3VibGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgRnJhZ21lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluRG91YmxlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChkb3VibGUtcXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgRnJhZ21lbnQuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3Qgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluRG91YmxlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShkb3VibGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoRG91YmxlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1cImh0dHA6Ly9leGFtcGxlLmNvbS8je3t7dXJpRnJhZ21lbnRJbkRvdWJsZVF1b3RlZEF0dHIgdXJpX2ZyYWdtZW50fX19XCI+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlGcmFnbWVudEluRG91YmxlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnl1YmwocHJpdkZpbHRlcnMueWF2ZChwcml2RmlsdGVycy55dWMocykpKTtcbn07XG5cbi8vIHVyaUZyYWdtZW50SW5VblF1b3RlZEF0dHJcbi8vIGFkZGVkIHl1Ymwgb24gdG9wIG9mIHVyaUNvbXBvbmVudEluQXR0ciBcbi8vIFJhdGlvbmFsZTogZ2l2ZW4gcGF0dGVybiBsaWtlIHRoaXM6IDxhIGhyZWY9e3t7dXJpRnJhZ21lbnRJblVuUXVvdGVkQXR0ciBzfX19PlxuLy8gICAgICAgICAgICBkZXZlbG9wZXIgbWF5IGV4cGVjdCBzIGlzIGFsd2F5cyBwcmVmaXhlZCB3aXRoICMsIGJ1dCBhbiBhdHRhY2tlciBjYW4gYWJ1c2UgaXQgd2l0aCAnamF2YXNjcmlwdDphbGVydCgxKSdcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpRnJhZ21lbnRJblVuUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIEZyYWdtZW50XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlICh1bnF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIEZyYWdtZW50Ljxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHRoZSBidWlsdC1pbiBlbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFVucXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPWh0dHA6Ly9leGFtcGxlLmNvbS8je3t7dXJpRnJhZ21lbnRJblVuUXVvdGVkQXR0ciB1cmlfZnJhZ21lbnR9fX0+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlGcmFnbWVudEluVW5RdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueXVibChwcml2RmlsdGVycy55YXZ1KHByaXZGaWx0ZXJzLnl1YyhzKSkpO1xufTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlGcmFnbWVudEluSFRNTERhdGFcbiogQGRlc2NyaXB0aW9uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJbkhUTUxEYXRhfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJbkhUTUxEYXRhXG4qL1xuZXhwb3J0cy51cmlGcmFnbWVudEluSFRNTERhdGEgPSBleHBvcnRzLnVyaUNvbXBvbmVudEluSFRNTERhdGE7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUZyYWdtZW50SW5IVE1MQ29tbWVudFxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnR9XG4qIFxuKiBAYWxpYXMgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnRcbiovXG5leHBvcnRzLnVyaUZyYWdtZW50SW5IVE1MQ29tbWVudCA9IGV4cG9ydHMudXJpQ29tcG9uZW50SW5IVE1MQ29tbWVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgc3RhdGUgPSB7XG4gIGFwcFRpdGxlOiAnQ29uZHVpdCcsXG4gIHNlbGVjdGVkQXJ0aWNsZXM6IHtcbiAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgIGxpc3Q6IG51bGwsXG4gICAgYXV0aG9yOiAnJyxcbiAgICBmYXZvcml0ZWQ6ICcnLFxuICAgIGxpbWl0OiAxMCxcbiAgICBvZmZzZXQ6IDAsXG4gICAgdG90YWw6IDAsXG4gICAgdHlwZToge1xuICAgICAgbmFtZTogJ0dMT0JBTCcsXG4gICAgICBsYWJlbDogJ0dsb2JhbCBGZWVkJ1xuICAgIH0sXG4gIH0sXG4gIGFydGljbGVMaXN0VHlwZXM6IHtcbiAgICBHTE9CQUw6IHtcbiAgICAgIG5hbWU6ICdHTE9CQUwnLFxuICAgICAgbGFiZWw6ICdHbG9iYWwgRmVlZCdcbiAgICB9LFxuICAgIFVTRVJfRkFWT1JJVEVEOiB7XG4gICAgICBuYW1lOiAnVVNFUl9GQVZPUklURUQnLFxuICAgICAgbGFiZWw6ICdZb3VyIEZlZWQnXG4gICAgfSxcbiAgICBVU0VSX09XTkVEOiB7XG4gICAgICBuYW1lOiAnVVNFUl9PV05FRCcsXG4gICAgICBsYWJlbDogJ015IEFydGljbGVzJ1xuICAgIH1cbiAgfSxcbiAgYXJ0aWNsZXNCeVRhZzoge30sXG4gIHRhZ3M6IHt9LFxuICBzZWxlY3RlZEFydGljbGU6IHtcbiAgICBkYXRhOiBudWxsLFxuICAgIGlzTG9hZGluZzogZmFsc2VcbiAgfSxcbiAgc2VsZWN0ZWRBcnRpY2xlQ29tbWVudHM6IHtcbiAgICBkYXRhOiBudWxsLFxuICAgIGlzTG9hZGluZzogZmFsc2VcbiAgfSxcbiAgaXNBcnRpY2xlQ29tbWVudENyZWF0aW9uQnVzeTogZmFsc2UsXG4gIHVzZXJBdXRob3JpemF0aW9uVG9rZW46IG51bGwsXG4gIGlzVXNlckxvZ2luQnVzeTogZmFsc2UsXG4gIHVzZXJMb2dpbkVycm9yczogbnVsbCxcbiAgaXNVc2VyUmVnaXN0cmF0aW9uQnVzeTogZmFsc2UsXG4gIHVzZXJSZWdpc3RyYXRpb25FcnJvcnM6IG51bGwsXG4gIGlzVXNlclNldHRpbmdzVXBkYXRlQnVzeTogZmFsc2UsXG4gIHVzZXJVcGRhdGVTZXR0aW5nc0Vycm9yczogbnVsbCxcbiAgaXNDcmVhdGVBcnRpY2xlQnVzeTogZmFsc2UsXG4gIGNyZWF0ZUFydGljbGVFcnJvcnM6IG51bGwsXG4gIGlzRGVsZXRlQXJ0aWNsZUJ1c3k6IGZhbHNlLFxuICB1c2VyOiBudWxsLFxuICBzZWxlY3RlZFVzZXJQcm9maWxlOiB7XG4gICAgZGF0YTogbnVsbCxcbiAgICBpc0xvYWRpbmc6IGZhbHNlXG4gIH1cbn07XG5cblxudmFyIEFQSV9CQVNFX1VSSSA9ICcvL2NvbmR1aXQucHJvZHVjdGlvbnJlYWR5LmlvL2FwaSc7XG5cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgYWN0aW9ucy5nZXRMb2dnZWRJblVzZXIod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdqd3QnKSk7XG59XG5cblxuZnVuY3Rpb24gZ2V0RXJyb3JNZXNzYWdlRnJvbUFQSUVycm9yT2JqZWN0KGUpIHtcbiAgdmFyIHJlc3BvbnNlID0gbnVsbDtcblxuICB0cnkge1xuICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShlLm1lc3NhZ2UpLmVycm9ycztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXNwb25zZSA9IHtcbiAgICAgICdBbiB1bmhhbmRsZWQgZXJyb3Igb2NjdXJyZWQnOiBbXVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2U7XG59XG5cblxuZnVuY3Rpb24gcmVkaXJlY3RUb1ByZXZpb3VzUGFnZU9ySG9tZSgpIHtcbiAgaWYgKHdpbmRvdy5oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKCk7XG4gIH0gZWxzZSB7XG4gICAgbS5yb3V0ZS5zZXQoJy8nKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGdldEFydGljbGVzKHBheWxvYWQpIHtcblx0Lypcblx0VE9ET1xuXG5cdEZpbHRlciBieSBhdXRob3I6XG5cblx0P2F1dGhvcj1qYWtlXG5cblx0RmF2b3JpdGVkIGJ5IHVzZXI6XG5cblx0P2Zhdm9yaXRlZD1qYWtlXG5cblx0TGltaXQgbnVtYmVyIG9mIGFydGljbGVzIChkZWZhdWx0IGlzIDIwKTpcblxuXHQ/bGltaXQ9MjBcblxuXHRPZmZzZXQvc2tpcCBudW1iZXIgb2YgYXJ0aWNsZXMgKGRlZmF1bHQgaXMgMCk6XG5cblx0P29mZnNldD0wXG5cdCovXG5cbiAgLy8gaWYgKCFwYXlsb2FkKSB7XG4gIC8vIFx0cGF5bG9hZCA9IHtcbiAgLy8gXHRcdGxpbWl0OiAzXG4gIC8vIFx0fTtcbiAgLy8gfVxuXG4gIHZhciBxdWVyeVN0cmluZyA9IG0uYnVpbGRRdWVyeVN0cmluZyhwYXlsb2FkKTtcblxuICByZXR1cm4gbS5yZXF1ZXN0KHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVybDogQVBJX0JBU0VfVVJJICsgJy9hcnRpY2xlcz8nICsgcXVlcnlTdHJpbmdcbiAgfSlcbiAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIC8vIHJldHVybiBbXTsgLy8gVGVzdCBlbXB0eSByZXNwb25zZVxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIGlzVmFsdWVOdWxsT3JVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCkgfHwgdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbn1cblxuXG5mdW5jdGlvbiBnZXRWYWx1ZUZyb21TdXBwbGllZE9yT3RoZXIoc3VwcGxpZWQsIG90aGVyKSB7XG4gIHJldHVybiAhaXNWYWx1ZU51bGxPclVuZGVmaW5lZChzdXBwbGllZCkgPyBzdXBwbGllZCA6IG90aGVyO1xufVxuXG5cbmZ1bmN0aW9uIHNldHVwU2VsZWN0ZWRBcnRpY2xlc1N0YXRlRm9yUmVxdWVzdChwYXlsb2FkLCBzZWxlY3RlZEFydGljbGVzKSB7XG4gIHZhciBzZWxlY3RlZEFydGljbGVzID0ge1xuICAgIGlzTG9hZGluZzogdHJ1ZSxcbiAgICBsaXN0OiBudWxsLFxuICAgIHRvdGFsOiAwLFxuICAgIHR5cGU6IGdldFZhbHVlRnJvbVN1cHBsaWVkT3JPdGhlcihwYXlsb2FkLnR5cGUsIHN0YXRlLmFydGljbGVMaXN0VHlwZXMudHlwZSksXG4gICAgbGltaXQ6IGdldFZhbHVlRnJvbVN1cHBsaWVkT3JPdGhlcihwYXlsb2FkLmxpbWl0LCBzdGF0ZS5hcnRpY2xlTGlzdFR5cGVzLmxpbWl0KSxcbiAgICBvZmZzZXQ6IGdldFZhbHVlRnJvbVN1cHBsaWVkT3JPdGhlcihwYXlsb2FkLm9mZnNldCwgc3RhdGUuYXJ0aWNsZUxpc3RUeXBlcy5vZmZzZXQpLFxuICAgIGF1dGhvcjogZ2V0VmFsdWVGcm9tU3VwcGxpZWRPck90aGVyKHBheWxvYWQuYXV0aG9yLCBzdGF0ZS5hcnRpY2xlTGlzdFR5cGVzLmF1dGhvciksXG4gICAgZmF2b3JpdGVkOiBnZXRWYWx1ZUZyb21TdXBwbGllZE9yT3RoZXIocGF5bG9hZC5mYXZvcml0ZWQsIHN0YXRlLmFydGljbGVMaXN0VHlwZXMuZmF2b3JpdGVkKVxuICB9O1xuXG4gIHJldHVybiBzZWxlY3RlZEFydGljbGVzO1xufVxuXG5cblxudmFyIGFjdGlvbnMgPSB7XG5cbiAgc2V0Q3VycmVudGx5QWN0aXZlQXJ0aWNsZXM6IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgdmFyIHJlcXVlc3QgPSB7fTtcbiAgICBwYXlsb2FkID0gcGF5bG9hZCB8fCB7fTtcblxuICAgIHN0YXRlLnNlbGVjdGVkQXJ0aWNsZXMgPSBzZXR1cFNlbGVjdGVkQXJ0aWNsZXNTdGF0ZUZvclJlcXVlc3QocGF5bG9hZCk7XG5cbiAgICByZXF1ZXN0LmxpbWl0ID0gc3RhdGUuc2VsZWN0ZWRBcnRpY2xlcy5saW1pdDtcbiAgICByZXF1ZXN0Lm9mZnNldCA9IHN0YXRlLnNlbGVjdGVkQXJ0aWNsZXMub2Zmc2V0O1xuICAgIHJlcXVlc3QuYXV0aG9yID0gc3RhdGUuc2VsZWN0ZWRBcnRpY2xlcy5hdXRob3I7XG4gICAgcmVxdWVzdC5mYXZvcml0ZWQgPSBzdGF0ZS5zZWxlY3RlZEFydGljbGVzLmZhdm9yaXRlZDtcblxuICAgIGNvbnNvbGUuaW5mbygnZG9tYWluLnNldEN1cnJlbnRseUFjdGl2ZUFydGljbGVzKCknLCBwYXlsb2FkLCByZXF1ZXN0KTtcblxuICAgIHJldHVybiBnZXRBcnRpY2xlcyhyZXF1ZXN0KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHN0YXRlLnNlbGVjdGVkQXJ0aWNsZXMubGlzdCA9IHJlc3BvbnNlLmFydGljbGVzO1xuICAgICAgICBzdGF0ZS5zZWxlY3RlZEFydGljbGVzLnRvdGFsID0gcmVzcG9uc2UuYXJ0aWNsZXNDb3VudDtcbiAgICAgICAgc3RhdGUuc2VsZWN0ZWRBcnRpY2xlcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9LFxuXG5cbiAgZ2V0QXJ0aWNsZXNCeVRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgIHJldHVybiBnZXRBcnRpY2xlcyh7IHRhZzogdGFnIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgc3RhdGUuYXJ0aWNsZXNCeVRhZy50YWcgPSB0YWc7XG4gICAgICAgIHN0YXRlLmFydGljbGVzQnlUYWcubGlzdCA9IHJlc3BvbnNlLmFydGljbGVzO1xuICAgICAgfSk7XG4gIH0sXG5cblxuICBzZXRTZWxlY3RlZEFydGljbGU6IGZ1bmN0aW9uIChzbHVnKSB7XG4gICAgc3RhdGUuc2VsZWN0ZWRBcnRpY2xlLmRhdGEgPSBudWxsO1xuICAgIHN0YXRlLnNlbGVjdGVkQXJ0aWNsZS5pc0xvYWRpbmcgPSB0cnVlO1xuXG4gICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJsOiBBUElfQkFTRV9VUkkgKyAnL2FydGljbGVzLycgKyBzbHVnXG4gICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBzdGF0ZS5zZWxlY3RlZEFydGljbGUuZGF0YSA9IHJlc3BvbnNlLmFydGljbGU7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBzdGF0ZS5zZWxlY3RlZEFydGljbGUuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfSxcblxuXG4gIHNldFNlbGVjdGVkQXJ0aWNsZUNvbW1lbnRzOiBmdW5jdGlvbiAoc2x1Zykge1xuICAgIHN0YXRlLnNlbGVjdGVkQXJ0aWNsZUNvbW1lbnRzLmRhdGEgPSBudWxsO1xuICAgIHN0YXRlLnNlbGVjdGVkQXJ0aWNsZUNvbW1lbnRzLmlzTG9hZGluZyA9IHRydWU7XG5cbiAgICByZXR1cm4gbS5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmw6IEFQSV9CQVNFX1VSSSArICcvYXJ0aWNsZXMvJyArIHNsdWcgKyAnL2NvbW1lbnRzJ1xuICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgc3RhdGUuc2VsZWN0ZWRBcnRpY2xlQ29tbWVudHMuZGF0YSA9IHJlc3BvbnNlLmNvbW1lbnRzO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RhdGUuc2VsZWN0ZWRBcnRpY2xlQ29tbWVudHMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgIH0pO1xuICB9LFxuXG5cbiAgY3JlYXRlQXJ0aWNsZTogZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICBzdGF0ZS5pc0NyZWF0ZUFydGljbGVCdXN5ID0gdHJ1ZTtcbiAgICBzdGF0ZS5jcmVhdGVBcnRpY2xlRXJyb3JzID0gbnVsbDtcblxuICAgIC8vIEZvcm1hdCB0YWdMaXN0IGJlZm9yZSBzZW5kaW5nIHRvIEFQSVxuICAgIHZhciB0YWdMaXN0ID0gcGF5bG9hZC50YWdMaXN0XG4gICAgICAuc3BsaXQoJywnKVxuICAgICAgLmpvaW4oJy18LScpXG4gICAgICAuc3BsaXQoJyAnKVxuICAgICAgLmpvaW4oJy18LScpXG4gICAgICAuc3BsaXQoJy18LScpXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgcmV0dXJuIHRhZyAhPT0gJyc7XG4gICAgICB9KTtcblxuICAgIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogQVBJX0JBU0VfVVJJICsgJy9hcnRpY2xlcycsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBdXRob3JpemF0aW9uJzogJ1Rva2VuICcgKyBzdGF0ZS51c2VyLnRva2VuXG4gICAgICB9LFxuICAgICAgZGF0YToge1xuICAgICAgICBhcnRpY2xlOiB7XG4gICAgICAgICAgdGl0bGU6IHBheWxvYWQudGl0bGUsXG4gICAgICAgICAgZGVzY3JpcHRpb246IHBheWxvYWQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgYm9keTogcGF5bG9hZC5ib2R5LFxuICAgICAgICAgIHRhZ0xpc3Q6IHRhZ0xpc3RcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgc3RhdGUuY3JlYXRlQXJ0aWNsZUVycm9ycyA9IG51bGw7XG4gICAgICAgIHN0YXRlLm5ld0FydGljbGUgPSByZXNwb25zZS5hcnRpY2xlO1xuICAgICAgICBtLnJvdXRlLnNldCgnL2FydGljbGUvJyArIHN0YXRlLm5ld0FydGljbGUuc2x1Zyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHN0YXRlLmNyZWF0ZUFydGljbGVFcnJvcnMgPSBnZXRFcnJvck1lc3NhZ2VGcm9tQVBJRXJyb3JPYmplY3QoZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBzdGF0ZS5pc0NyZWF0ZUFydGljbGVCdXN5ID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfSxcblxuXG4gIGRlbGV0ZUFydGljbGU6IGZ1bmN0aW9uIChzbHVnKSB7XG4gICAgc3RhdGUuaXNEZWxldGVBcnRpY2xlQnVzeSA9IHRydWU7XG4gICAgbS5yZWRyYXcoKTsgLy8gVGhpcyBzaG91bGRuJ3QgYmUgbmVjZXNzYXJ5XG5cbiAgICBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgIHVybDogQVBJX0JBU0VfVVJJICsgJy9hcnRpY2xlcy8nICsgc2x1ZyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnVG9rZW4gJyArIHN0YXRlLnVzZXIudG9rZW5cbiAgICAgIH1cbiAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhyZXNwb25zZSk7XG4gICAgICAgIHN0YXRlLmlzRGVsZXRlQXJ0aWNsZUJ1c3kgPSBmYWxzZTtcbiAgICAgICAgLy8gaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIHJlZGlyZWN0VG9QcmV2aW91c1BhZ2VPckhvbWUoKTtcbiAgICAgICAgLy8gfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICBzdGF0ZS5pc0RlbGV0ZUFydGljbGVCdXN5ID0gZmFsc2U7XG4gICAgICAgIGNvbnNvbGUud2FybihnZXRFcnJvck1lc3NhZ2VGcm9tQVBJRXJyb3JPYmplY3QoZSkpO1xuICAgICAgfSk7XG4gIH0sXG5cblxuICBjcmVhdGVBcnRpY2xlQ29tbWVudDogZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICBzdGF0ZS5pc0FydGljbGVDb21tZW50Q3JlYXRpb25CdXN5ID0gdHJ1ZTtcblxuICAgIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogQVBJX0JBU0VfVVJJICsgJy9hcnRpY2xlcy8nICsgcGF5bG9hZC5hcnRpY2xlU2x1ZyArICcvY29tbWVudHMnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQXV0aG9yaXphdGlvbic6ICdUb2tlbiAnICsgc3RhdGUudXNlci50b2tlblxuICAgICAgfSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgY29tbWVudDoge1xuICAgICAgICAgIGJvZHk6IHBheWxvYWQuYm9keVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RhdGUuaXNBcnRpY2xlQ29tbWVudENyZWF0aW9uQnVzeSA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWN0aW9ucy5zZXRTZWxlY3RlZEFydGljbGVDb21tZW50cyhwYXlsb2FkLmFydGljbGVTbHVnKTtcbiAgICAgIH0pO1xuICB9LFxuXG5cbiAgZ29Ub0FydGljbGVFZGl0U2NyZWVuOiBmdW5jdGlvbiAoYXJ0aWNsZVNsdWcpIHtcbiAgICBtLnJvdXRlLnNldCgnL2VkaXRvci8nICsgYXJ0aWNsZVNsdWcpO1xuICB9LFxuXG5cbiAgcmVnaXN0ZXJOZXdVc2VyOiBmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgIHN0YXRlLmlzVXNlclJlZ2lzdHJhdGlvbkJ1c3kgPSB0cnVlO1xuICAgIHN0YXRlLnVzZXJSZWdpc3RyYXRpb25FcnJvcnMgPSBudWxsO1xuXG4gICAgbS5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsOiBBUElfQkFTRV9VUkkgKyAnL3VzZXJzJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdXNlcjoge1xuICAgICAgICAgIGVtYWlsOiBwYXlsb2FkLmVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiBwYXlsb2FkLnBhc3N3b3JkLFxuICAgICAgICAgIHVzZXJuYW1lOiBwYXlsb2FkLnVzZXJuYW1lXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHN0YXRlLnVzZXJSZWdpc3RyYXRpb25FcnJvcnMgPSBudWxsO1xuICAgICAgICBzdGF0ZS51c2VyID0gcmVzcG9uc2UudXNlcjtcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdqd3QnLCBzdGF0ZS51c2VyLnRva2VuKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgc3RhdGUudXNlclJlZ2lzdHJhdGlvbkVycm9ycyA9IGdldEVycm9yTWVzc2FnZUZyb21BUElFcnJvck9iamVjdChlKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0YXRlLmlzVXNlclJlZ2lzdHJhdGlvbkJ1c3kgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9LFxuXG5cbiAgYXR0ZW1wdFVzZXJMb2dpbjogZnVuY3Rpb24gKGVtYWlsLCBwYXNzd29yZCkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnand0JywgbnVsbCk7XG4gICAgc3RhdGUudXNlciA9IG51bGw7XG4gICAgc3RhdGUuaXNVc2VyTG9naW5CdXN5ID0gdHJ1ZTtcbiAgICBzdGF0ZS51c2VyTG9naW5FcnJvcnMgPSBudWxsO1xuXG4gICAgbS5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsOiBBUElfQkFTRV9VUkkgKyAnL3VzZXJzL2xvZ2luJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdXNlcjoge1xuICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgc3RhdGUudXNlckxvZ2luRXJyb3JzID0gbnVsbDtcbiAgICAgICAgc3RhdGUudXNlciA9IHJlc3BvbnNlLnVzZXI7XG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnand0Jywgc3RhdGUudXNlci50b2tlbik7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHN0YXRlLnVzZXJMb2dpbkVycm9ycyA9IGdldEVycm9yTWVzc2FnZUZyb21BUElFcnJvck9iamVjdChlKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0YXRlLmlzVXNlckxvZ2luQnVzeSA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH0sXG5cblxuICByZWRpcmVjdEFmdGVyVXNlckxvZ2luU3VjY2VzczogZnVuY3Rpb24gKCkge1xuICAgIHJlZGlyZWN0VG9QcmV2aW91c1BhZ2VPckhvbWUoKTtcbiAgfSxcblxuXG4gIHJlZGlyZWN0QWZ0ZXJVc2VyUmVnaXN0cmF0aW9uU3VjY2VzczogZnVuY3Rpb24gKCkge1xuICAgIHJlZGlyZWN0VG9QcmV2aW91c1BhZ2VPckhvbWUoKTtcbiAgfSxcblxuXG4gIGdldExvZ2dlZEluVXNlcjogZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgdmFyIHVzZXJUb2tlbiA9IHN0YXRlLnVzZXIgPyBzdGF0ZS51c2VyLnRva2VuIDogJyc7XG5cbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIHVzZXJUb2tlbiA9IHRva2VuO1xuICAgIH1cblxuICAgIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJsOiBBUElfQkFTRV9VUkkgKyAnL3VzZXInLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQXV0aG9yaXphdGlvbic6ICdUb2tlbiAnICsgdXNlclRva2VuXG4gICAgICB9XG4gICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBzdGF0ZS51c2VyID0gcmVzcG9uc2UudXNlcjtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdkb21haW4uZ2V0TG9nZ2VkSW5Vc2VyKCknLCBlLCBnZXRFcnJvck1lc3NhZ2VGcm9tQVBJRXJyb3JPYmplY3QoZSkpO1xuICAgICAgfSk7XG4gIH0sXG5cblxuICB1cGRhdGVVc2VyU2V0dGluZ3M6IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgc3RhdGUuaXNVc2VyU2V0dGluZ3NVcGRhdGVCdXN5ID0gdHJ1ZTtcbiAgICBzdGF0ZS51c2VyVXBkYXRlU2V0dGluZ3NFcnJvcnMgPSBudWxsO1xuXG4gICAgaWYgKCFwYXlsb2FkLnBhc3N3b3JkKSB7XG4gICAgICBkZWxldGUgcGF5bG9hZC5wYXNzd29yZDtcbiAgICB9XG5cbiAgICBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgIHVybDogQVBJX0JBU0VfVVJJICsgJy91c2VyJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnVG9rZW4gJyArIHN0YXRlLnVzZXIudG9rZW5cbiAgICAgIH0sXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHVzZXI6IHBheWxvYWRcbiAgICAgIH1cbiAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHN0YXRlLnVzZXIgPSByZXNwb25zZS51c2VyO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICBzdGF0ZS51c2VyVXBkYXRlU2V0dGluZ3NFcnJvcnMgPSBnZXRFcnJvck1lc3NhZ2VGcm9tQVBJRXJyb3JPYmplY3QoZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBzdGF0ZS5pc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3kgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9LFxuXG5cbiAgZ2V0VXNlclByb2ZpbGU6IGZ1bmN0aW9uICh1c2VybmFtZSkge1xuICAgIHN0YXRlLnNlbGVjdGVkVXNlclByb2ZpbGUuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICBzdGF0ZS5zZWxlY3RlZFVzZXJQcm9maWxlLmRhdGEgPSBudWxsO1xuXG4gICAgbS5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmw6IEFQSV9CQVNFX1VSSSArICcvcHJvZmlsZXMvJyArIHVzZXJuYW1lXG4gICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBzdGF0ZS5zZWxlY3RlZFVzZXJQcm9maWxlLmRhdGEgPSByZXNwb25zZS5wcm9maWxlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RhdGUuc2VsZWN0ZWRVc2VyUHJvZmlsZS5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9LFxuXG5cbiAgZm9sbG93VXNlcjogZnVuY3Rpb24gKHVzZXJuYW1lKSB7XG4gICAgcmV0dXJuIGFsZXJ0KCdmb2xsb3dVc2VyKCkgLT4gJyArIHVzZXJuYW1lKTtcbiAgICBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6IEFQSV9CQVNFX1VSSSArICcvcHJvZmlsZXMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3cnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQXV0aG9yaXphdGlvbic6ICdUb2tlbiAnICsgc3RhdGUudXNlci50b2tlblxuICAgICAgfSxcbiAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBUT0RPXG4gICAgICB9KTtcbiAgfSxcblxuXG4gIHVuZm9sbG93VXNlcjogZnVuY3Rpb24gKHVzZXJuYW1lKSB7XG4gICAgcmV0dXJuIGFsZXJ0KCd1bmZvbGxvd1VzZXIoKSAtPiAnICsgdXNlcm5hbWUpO1xuICAgIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgdXJsOiBBUElfQkFTRV9VUkkgKyAnL3Byb2ZpbGVzLycgKyB1c2VybmFtZSArICcvZm9sbG93JyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnVG9rZW4gJyArIHN0YXRlLnVzZXIudG9rZW5cbiAgICAgIH0sXG4gICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gVE9ET1xuICAgICAgfSk7XG4gIH0sXG5cblxuICBsb2dVc2VyT3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgc3RhdGUudXNlciA9IG51bGw7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdqd3QnLCBudWxsKTtcbiAgICBtLnJvdXRlLnNldCgnLycpO1xuICB9LFxuXG5cbiAgZ2V0VGFnczogZnVuY3Rpb24gKCkge1xuICAgIHN0YXRlLnRhZ3MuaXNMb2FkaW5nID0gdHJ1ZTtcblxuICAgIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJsOiBBUElfQkFTRV9VUkkgKyAnL3RhZ3MnLFxuICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgc3RhdGUudGFncy5saXN0ID0gcmVzcG9uc2UudGFncztcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0YXRlLnRhZ3MuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBpbml0LFxuICBzdG9yZTogc3RhdGUsXG4gIGFjdGlvbnM6IGFjdGlvbnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxucmVxdWlyZSgnLi9kb21haW4nKS5pbml0KCk7XG5yZXF1aXJlKCcuL3VpL3JvdXRlcicpLmluaXQoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuICByZXR1cm4gbSgnZm9vdGVyJyxcbiAgICBtKCcuY29udGFpbmVyJywgW1xuICAgICAgbSgnYS5sb2dvLWZvbnQnLCB7IGhyZWY6ICcvJyB9LCAnY29uZHVpdCcpLFxuICAgICAgbSgnc3Bhbi5hdHRyaWJ1dGlvbicsXG4gICAgICAgIG0udHJ1c3QoJ0FuIGludGVyYWN0aXZlIGxlYXJuaW5nIHByb2plY3QgZnJvbSA8YSBocmVmPVwiaHR0cHM6Ly90aGlua3N0ZXIuaW9cIj5UaGlua3N0ZXI8L2E+LiBDb2RlICZhbXA7IGRlc2lnbiBsaWNlbnNlZCB1bmRlciBNSVQuJylcbiAgICAgIClcbiAgICBdKVxuICApO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcbnZhciBNYWluTmF2ID0gcmVxdWlyZSgnLi9NYWluTmF2Jyk7XG52YXIgTGluayA9IHJlcXVpcmUoJy4vTGluaycpO1xuXG5cbmZ1bmN0aW9uIHZpZXcoKSB7XG4gIHJldHVybiBtKCdoZWFkZXInLFxuICAgIG0oJ25hdi5uYXZiYXIubmF2YmFyLWxpZ2h0JyxcbiAgICAgIG0oJy5jb250YWluZXInLFxuICAgICAgICBtKExpbmssIHsgY2xhc3NOYW1lOiAnbmF2YmFyLWJyYW5kIHB1bGwteHMtbm9uZSBwdWxsLW1kLWxlZnQnLCB0bzogJy8nIH0sICdjb25kdWl0JyksXG4gICAgICAgIG0oTWFpbk5hdiwgeyBjbGFzc05hbWU6ICduYXYgbmF2YmFyLW5hdiBwdWxsLXhzLW5vbmUgcHVsbC1tZC1yaWdodCB0ZXh0LXhzLWNlbnRlcicsIGN1cnJlbnRVc2VyOiBkb21haW4uc3RvcmUudXNlciB9KVxuICAgICAgKVxuICAgIClcbiAgKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgQXJ0aWNsZUZhdm9yaXRlQnV0dG9uID0gcmVxdWlyZSgnLi9BcnRpY2xlRmF2b3JpdGVCdXR0b24nKTtcbnZhciBBcnRpY2xlVXBkYXRlQnV0dG9uID0gcmVxdWlyZSgnLi9BcnRpY2xlVXBkYXRlQnV0dG9uJyk7XG52YXIgQXJ0aWNsZURlbGV0ZUJ1dHRvbiA9IHJlcXVpcmUoJy4vQXJ0aWNsZURlbGV0ZUJ1dHRvbicpO1xudmFyIFVzZXJGb2xsb3dVbmZvbGxvd0J1dHRvbiA9IHJlcXVpcmUoJy4vVXNlckZvbGxvd1VuZm9sbG93QnV0dG9uJyk7XG5cblxuZnVuY3Rpb24gdXBkYXRlU3RhdGUodm5vZGUpIHtcbiAgdm5vZGUuc3RhdGUgPSB7XG4gICAgYXJ0aWNsZTogdm5vZGUuYXR0cnMuYXJ0aWNsZS5kYXRhLFxuICAgIGlzRGVsZXRlQXJ0aWNsZUJ1c3k6IGRvbWFpbi5zdG9yZS5pc0RlbGV0ZUFydGljbGVCdXN5XG4gIH07XG59XG5cblxuZnVuY3Rpb24gb25pbml0KHZub2RlKSB7XG4gIHVwZGF0ZVN0YXRlKHZub2RlKTtcbn1cblxuXG5mdW5jdGlvbiBvbnVwZGF0ZSh2bm9kZSkge1xuICB1cGRhdGVTdGF0ZSh2bm9kZSk7XG59XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuICB2YXIgYXJ0aWNsZSA9IHZub2RlLmF0dHJzLmFydGljbGUuZGF0YSA/IHZub2RlLmF0dHJzLmFydGljbGUuZGF0YSA6IHtcbiAgICBhdXRob3I6IHtcbiAgICAgIHVzZXJuYW1lOiBudWxsXG4gICAgfVxuICB9O1xuXG4gIHZhciBsb2dnZWRJblVzZXJuYW1lID0gZG9tYWluLnN0b3JlLnVzZXIgPyBkb21haW4uc3RvcmUudXNlci51c2VybmFtZSA6ICcnO1xuXG4gIHJldHVybiBbXG4gICAgbShBcnRpY2xlVXBkYXRlQnV0dG9uLCB7IGFjdGlvbjogZG9tYWluLmFjdGlvbnMuZ29Ub0FydGljbGVFZGl0U2NyZWVuLmJpbmQobnVsbCwgYXJ0aWNsZS5zbHVnKSB9KSxcbiAgICBtKCdzcGFuJywgJyAnKSxcbiAgICBtKEFydGljbGVEZWxldGVCdXR0b24sIHsgYWN0aW9uOiBkb21haW4uYWN0aW9ucy5kZWxldGVBcnRpY2xlLmJpbmQobnVsbCwgYXJ0aWNsZS5zbHVnKSB9KSxcbiAgICBtKCdzcGFuJywgJyAnKSxcbiAgICBtKFVzZXJGb2xsb3dVbmZvbGxvd0J1dHRvbiwgeyBpc0ZvbGxvd2luZzogYXJ0aWNsZS5hdXRob3IuZm9sbG93aW5nLCB1c2VybmFtZTogYXJ0aWNsZS5hdXRob3IudXNlcm5hbWUsIGxvZ2dlZEluVXNlcm5hbWU6IGxvZ2dlZEluVXNlcm5hbWUgfSksXG4gICAgbSgnc3BhbicsICcgJyksXG4gICAgbShBcnRpY2xlRmF2b3JpdGVCdXR0b24sIHsgYXJ0aWNsZTogYXJ0aWNsZSB9KVxuICBdO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb25pbml0OiBvbmluaXQsXG4gIG9udXBkYXRlOiBvbnVwZGF0ZSxcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgQXJ0aWNsZU1ldGFBbmRBY3Rpb25zID0gcmVxdWlyZSgnLi9BcnRpY2xlTWV0YUFuZEFjdGlvbnMnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHZhciB0aXRsZSA9IHZub2RlLmF0dHJzLmFydGljbGUuZGF0YSA/IHZub2RlLmF0dHJzLmFydGljbGUuZGF0YS50aXRsZSA6ICcuLi4nO1xuXG4gIHJldHVybiBtKCdkaXYnLCBbXG4gICAgbSgnaDEnLCB0aXRsZSksXG4gICAgbShBcnRpY2xlTWV0YUFuZEFjdGlvbnMsIHsgYXJ0aWNsZTogdm5vZGUuYXR0cnMuYXJ0aWNsZSB9KVxuICBdKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIFRhZ0xpc3QgPSByZXF1aXJlKCcuL1RhZ0xpc3QnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHZhciBhcnRpY2xlID0gdm5vZGUuYXR0cnMuYXJ0aWNsZS5kYXRhO1xuICB2YXIgY29udGVudCA9IG0oJ2RpdicsICcuLi4nKTtcblxuICBpZiAoYXJ0aWNsZSkge1xuICAgIGNvbnRlbnQgPSBbXG4gICAgICBtKCdkaXYuY29sLXhzLTEyJywgW1xuICAgICAgICBtKCdkaXYnLCBtLnRydXN0KHV0aWxzLmNvbnZlcnRNYXJrZG93blRvSFRNTChhcnRpY2xlLmJvZHkpKSksXG4gICAgICAgIG0oVGFnTGlzdCwgeyBsaXN0OiBhcnRpY2xlLnRhZ0xpc3QsIHN0eWxlOiBUYWdMaXN0LnN0eWxlcy5PVVRMSU5FIH0pXG4gICAgICBdKVxuICAgIF07XG4gIH1cblxuICByZXR1cm4gbSgnZGl2LmFydGljbGUtY29udGVudCcsIGNvbnRlbnQpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHJldHVybiBbXG4gICAgbSgnc3BhbicsXG4gICAgICBtKCdidXR0b24uYnRuLmJ0bi1vdXRsaW5lLWRhbmdlci5idG4tc20nLCB7IG9uY2xpY2s6IHZub2RlLmF0dHJzLmFjdGlvbiB9LCBbXG4gICAgICAgIG0oJ2kuaW9uLXRyYXNoLWEnKSwgbSgnc3BhbicsICcgRGVsZXRlIEFydGljbGUnKVxuICAgICAgXSlcbiAgICApXG4gIF07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbmZ1bmN0aW9uIG9uRmF2b3JpdGVCdXR0b25DbGljayhlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHZhciBjb3VudCA9IHR5cGVvZiB2bm9kZS5hdHRycy5hcnRpY2xlLmZhdm9yaXRlc0NvdW50ID09PSAnbnVtYmVyJyA/IHZub2RlLmF0dHJzLmFydGljbGUuZmF2b3JpdGVzQ291bnQgOiAnLi4uJztcblxuICByZXR1cm4gW1xuICAgIG0oJ3NwYW4nLFxuICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLW91dGxpbmUtcHJpbWFyeScsIHsgb25jbGljazogb25GYXZvcml0ZUJ1dHRvbkNsaWNrLmJpbmQodGhpcykgfSwgW1xuICAgICAgICBtKCdpLmlvbi1oZWFydCcpLCBtKCdzcGFuJywgJyBGYXZvcml0ZSBBcnRpY2xlICgnICsgY291bnQgKyAnKScpXG4gICAgICBdKVxuICAgIClcbiAgXTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgQXJ0aWNsZVByZXZpZXcgPSByZXF1aXJlKCcuL0FydGljbGVQcmV2aWV3Jyk7XG52YXIgUGFnaW5hdGlvbiA9IHJlcXVpcmUoJy4vUGFnaW5hdGlvbicpO1xuXG5cbmZ1bmN0aW9uIGdldFRvdGFsUGFnZXMobGltaXQsIHRvdGFsKSB7XG4gIHJldHVybiBNYXRoLmNlaWwodG90YWwgLyAobGltaXQgfHwgdG90YWwpKTtcbn1cblxuXG5mdW5jdGlvbiBnZXRDdXJyZW50UGFnZShsaW1pdCwgb2Zmc2V0KSB7XG4gIHJldHVybiBNYXRoLmNlaWwoKG9mZnNldCArIDEpIC8gbGltaXQpO1xufVxuXG5cbmZ1bmN0aW9uIGdldE9mZnNldEZyb21QYWdlTnVtYmVyKHBhZ2VOdW1iZXIsIGxpbWl0KSB7XG4gIHJldHVybiBNYXRoLmNlaWwoKHBhZ2VOdW1iZXIgLSAxKSAqIGxpbWl0KTtcbn1cblxuXG5mdW5jdGlvbiBnZXRDdXJyZW50TGltaXRGcm9tQXJ0aWNsZXMoYXJ0aWNsZXMpIHtcbiAgcmV0dXJuIGFydGljbGVzLmxpbWl0IHx8IDA7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlU2VsZWN0ZWRBcnRpY2xlcygpIHtcbiAgLy8gZG9tYWluLmFjdGlvbnMuc2V0Q3VycmVudGx5QWN0aXZlQXJ0aWNsZXMoe1xuICAvLyBsaW1pdDogbGltaXQsXG4gIC8vIG9mZnNldDogb2Zmc2V0LFxuICAvLyBhdXRob3I6IGF1dGhvclxuICAvLyB9KTtcbn1cblxuXG5mdW5jdGlvbiBzZWxlY3RQYWdlKHBhZ2VOdW1iZXIpIHtcbiAgdmFyIGxpbWl0ID0gZ2V0Q3VycmVudExpbWl0RnJvbUFydGljbGVzKGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGVzKTtcbiAgdXBkYXRlU2VsZWN0ZWRBcnRpY2xlcyhsaW1pdCwgZ2V0T2Zmc2V0RnJvbVBhZ2VOdW1iZXIocGFnZU51bWJlciwgbGltaXQpLCB0aGlzLmF1dGhvcik7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlU3RhdGVGcm9tQXR0cmlidXRlcyhzdGF0ZSwgYXR0cnMpIHtcbiAgc3RhdGUubGltaXQgPSBhdHRycy5saW1pdCB8fCAxMDtcbiAgc3RhdGUub2Zmc2V0ID0gYXR0cnMub2Zmc2V0IHx8IDA7XG4gIHN0YXRlLmF1dGhvciA9IGF0dHJzLmF1dGhvciB8fCAnJztcblxuICByZXR1cm4gc3RhdGU7XG59XG5cblxuZnVuY3Rpb24gb25pbml0KHZub2RlKSB7XG4gIHVwZGF0ZVN0YXRlRnJvbUF0dHJpYnV0ZXModGhpcywgdm5vZGUuYXR0cnMpO1xuICB1cGRhdGVTZWxlY3RlZEFydGljbGVzKHRoaXMubGltaXQsIHRoaXMub2Zmc2V0LCB0aGlzLmF1dGhvcik7XG59XG5cblxuZnVuY3Rpb24gb25iZWZvcmV1cGRhdGUodm5vZGUsIHZub2RlUHJldmlvdXMpIHtcbiAgaWYgKEpTT04uc3RyaW5naWZ5KHZub2RlLmF0dHJzKSAhPT0gSlNPTi5zdHJpbmdpZnkodm5vZGVQcmV2aW91cy5hdHRycykpIHtcbiAgICB1cGRhdGVTdGF0ZUZyb21BdHRyaWJ1dGVzKHRoaXMsIHZub2RlLmF0dHJzKTtcbiAgICB1cGRhdGVTZWxlY3RlZEFydGljbGVzKHRoaXMubGltaXQsIHRoaXMub2Zmc2V0LCB0aGlzLmF1dGhvcik7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuICB2YXIgdG90YWxQYWdlcyA9IDEsXG4gICAgY3VycmVudFBhZ2UgPSAxO1xuXG4gIGlmIChkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlcy5pc0xvYWRpbmcpIHtcbiAgICByZXR1cm4gbSgnZGl2LmFydGljbGUtcHJldmlldycsICdMb2FkaW5nLi4uJyk7XG4gIH1cblxuICBpZiAoZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZXMubGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbSgnZGl2LmFydGljbGUtcHJldmlldycsICdObyBhcnRpY2xlcyBhcmUgaGVyZS4uLiB5ZXQuJyk7XG4gIH1cblxuICB0b3RhbFBhZ2VzID0gZ2V0VG90YWxQYWdlcyhkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlcy5saW1pdCwgZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZXMudG90YWwpO1xuICBjdXJyZW50UGFnZSA9IGdldEN1cnJlbnRQYWdlKGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGVzLmxpbWl0LCBkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlcy5vZmZzZXQpO1xuXG4gIHJldHVybiBtKCdkaXYnLCBbXG4gICAgZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZXMubGlzdC5tYXAoZnVuY3Rpb24gKGFydGljbGUpIHtcbiAgICAgIHJldHVybiBtKEFydGljbGVQcmV2aWV3LCB7IGtleTogYXJ0aWNsZS5zbHVnLCBhcnRpY2xlOiBhcnRpY2xlIH0pO1xuICAgIH0pLFxuICAgIG0oUGFnaW5hdGlvbiwgeyB0b3RhbFBhZ2VzOiB0b3RhbFBhZ2VzLCBjdXJyZW50UGFnZTogY3VycmVudFBhZ2UsIGZuX29uSXRlbUNsaWNrOiBzZWxlY3RQYWdlLmJpbmQodGhpcykgfSlcbiAgXSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvbmluaXQ6IG9uaW5pdCxcbiAgb25iZWZvcmV1cGRhdGU6IG9uYmVmb3JldXBkYXRlLFxuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBMaW5rID0gcmVxdWlyZSgnLi9MaW5rJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuICB2YXIgYXJ0aWNsZSA9IHZub2RlLmF0dHJzLmFydGljbGUgPyB2bm9kZS5hdHRycy5hcnRpY2xlLmRhdGEgOiBudWxsO1xuICB2YXIgY29udGVudCA9IG0oJ2RpdicsICcuLi4nKTtcblxuICBpZiAoYXJ0aWNsZSkge1xuICAgIGNvbnRlbnQgPSBbXG4gICAgICBtKExpbmssIHsgdG86ICcvQCcgKyBhcnRpY2xlLmF1dGhvci51c2VybmFtZSB9LFxuICAgICAgICBtKCdpbWcnLCB7IHNyYzogYXJ0aWNsZS5hdXRob3IuaW1hZ2UgfSlcbiAgICAgICksXG4gICAgICBtKCdkaXYuaW5mbycsXG4gICAgICAgIG0oTGluaywgeyBjbGFzc05hbWU6ICdhdXRob3InLCB0bzogJy9AJyArIGFydGljbGUuYXV0aG9yLnVzZXJuYW1lIH0sIGFydGljbGUuYXV0aG9yLnVzZXJuYW1lKSxcbiAgICAgICAgbSgnc3Bhbi5kYXRlJywgdXRpbHMuZm9ybWF0RGF0ZShhcnRpY2xlLmNyZWF0ZWRBdCkpXG4gICAgICApXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiBtKCdkaXYuYXJ0aWNsZS1tZXRhJywgeyBzdHlsZTogdm5vZGUuYXR0cnMuc3R5bGUgfSwgW1xuICAgIGNvbnRlbnRcbiAgXSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBBcnRpY2xlTWV0YSA9IHJlcXVpcmUoJy4vQXJ0aWNsZU1ldGEnKTtcbnZhciBBcnRpY2xlQWN0aW9ucyA9IHJlcXVpcmUoJy4vQXJ0aWNsZUFjdGlvbnMnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHJldHVybiBbXG4gICAgbShBcnRpY2xlTWV0YSwgeyBhcnRpY2xlOiB2bm9kZS5hdHRycy5hcnRpY2xlLCBzdHlsZTogJ2Rpc3BsYXk6aW5saW5lLWJsb2NrOyAnIH0pLFxuICAgIG0oQXJ0aWNsZUFjdGlvbnMsIHsgYXJ0aWNsZTogdm5vZGUuYXR0cnMuYXJ0aWNsZSB9KVxuICBdO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgTGluayA9IHJlcXVpcmUoJy4vTGluaycpO1xuXG5cbnZhciBGQVZPUklURURfQ0xBU1MgPSAnYnRuIGJ0bi1zbSBidG4tcHJpbWFyeSc7XG52YXIgTk9UX0ZBVk9SSVRFRF9DTEFTUyA9ICdidG4gYnRuLXNtIGJ0bi1vdXRsaW5lLXByaW1hcnknO1xuXG5cbmZ1bmN0aW9uIG9uRmF2b3JpdGVCdXR0b25DbGljayhlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgLy8gVE9ETyBhZGQgaW1wbGVtZW50YXRpb25cbn1cblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHZhciBhcnRpY2xlID0gdm5vZGUuYXR0cnMuYXJ0aWNsZSxcbiAgICBmYXZvcml0ZUJ1dHRvbkNsYXNzID0gYXJ0aWNsZS5mYXZvcml0ZWQgP1xuICAgICAgRkFWT1JJVEVEX0NMQVNTIDpcbiAgICAgIE5PVF9GQVZPUklURURfQ0xBU1M7XG5cbiAgcmV0dXJuIG0oJy5hcnRpY2xlLXByZXZpZXcnLFxuICAgIG0oJy5jb250YWluZXInLCBbXG4gICAgICBtKCcuYXJ0aWNsZS1tZXRhJywgW1xuICAgICAgICBtKExpbmssIHsgdG86ICcvQCcgKyBhcnRpY2xlLmF1dGhvci51c2VybmFtZSB9LFxuICAgICAgICAgIG0oJ2ltZycsIHsgc3JjOiBhcnRpY2xlLmF1dGhvci5pbWFnZSB9KVxuICAgICAgICApLFxuXG4gICAgICAgIG0oJy5pbmZvJywgW1xuICAgICAgICAgIG0oTGluaywgeyB0bzogJy9AJyArIGFydGljbGUuYXV0aG9yLnVzZXJuYW1lLCBjbGFzc05hbWU6ICdhdXRob3InIH0sIGFydGljbGUuYXV0aG9yLnVzZXJuYW1lKSxcbiAgICAgICAgICBtKCcuZGF0ZScsIG5ldyBEYXRlKGFydGljbGUuY3JlYXRlZEF0KS50b0RhdGVTdHJpbmcoKSlcbiAgICAgICAgXSksXG5cbiAgICAgICAgbSgnLnB1bGwteHMtcmlnaHQnLFxuICAgICAgICAgIG0oJ2J1dHRvbicsIHsgY2xhc3NOYW1lOiBmYXZvcml0ZUJ1dHRvbkNsYXNzLCBvbmNsaWNrOiBvbkZhdm9yaXRlQnV0dG9uQ2xpY2sgfSwgW1xuICAgICAgICAgICAgbSgnaS5pb24taGVhcnQnKSxcbiAgICAgICAgICAgIG0oJ3NwYW4nLCAnICcgKyBhcnRpY2xlLmZhdm9yaXRlc0NvdW50KVxuICAgICAgICAgIF0pXG4gICAgICAgIClcblxuICAgICAgXSksXG5cbiAgICAgIG0oTGluaywgeyB0bzogJy9hcnRpY2xlLycgKyBhcnRpY2xlLnNsdWcsIGNsYXNzTmFtZTogJ3ByZXZpZXctbGluaycgfSwgW1xuICAgICAgICBtKCdoMScsIGFydGljbGUudGl0bGUpLFxuICAgICAgICBtKCdwJywgYXJ0aWNsZS5kZXNjcmlwdGlvbiksXG4gICAgICAgIG0oJ3NwYW4nLCAnUmVhZCBtb3JlLi4uJyksXG4gICAgICAgIG0oJ3VsLnRhZy1saXN0JywgYXJ0aWNsZS50YWdMaXN0Lm1hcChmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgcmV0dXJuIG0oJ2xpLnRhZy1kZWZhdWx0IHRhZy1waWxsIHRhZy1vdXRsaW5lJywgeyBrZXk6IHRhZyB9LCB0YWcpO1xuICAgICAgICB9KSlcbiAgICAgIF0pXG5cbiAgICBdKVxuICApO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHJldHVybiBbXG4gICAgbSgnc3BhbicsXG4gICAgICBtKCdidXR0b24uYnRuLmJ0bi1vdXRsaW5lLXNlY29uZGFyeS5idG4tc20nLCB7IG9uY2xpY2s6IHZub2RlLmF0dHJzLmFjdGlvbiB9LCBbXG4gICAgICAgIG0oJ2kuaW9uLWVkaXQnKSwgbSgnc3BhbicsICcgRWRpdCBBcnRpY2xlJylcbiAgICAgIF0pXG4gICAgKVxuICBdO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHZhciBjb250ZW50ID0gW1xuICAgIG0oJ2gxLmxvZ28tZm9udCcsICdjb25kdWl0JyksXG4gICAgbSgncCcsICdBIHBsYWNlIHRvIHNoYXJlIHlvdXIga25vd2xlZGdlLicpXG4gIF07XG5cbiAgaWYgKHZub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICBjb250ZW50ID0gdm5vZGUuY2hpbGRyZW47XG4gIH1cblxuICByZXR1cm4gbSgnLmJhbm5lcicsXG4gICAgbSgnLmNvbnRhaW5lcicsIGNvbnRlbnQpXG4gICk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBMaW5rID0gcmVxdWlyZSgnLi9MaW5rJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuICB2YXIgY29tbWVudCA9IHZub2RlLmF0dHJzLmNvbW1lbnQ7XG5cbiAgcmV0dXJuIG0oJ2Rpdi5jYXJkJywgW1xuICAgIG0oJ2Rpdi5jYXJkLWJsb2NrJyxcbiAgICAgIG0oJ2Rpdi5jYXJkLXRleHQnLCBtLnRydXN0KHV0aWxzLmZvcm1hdEFydGljbGVDb21tZW50Qm9keVRleHQoY29tbWVudC5ib2R5KSkpXG4gICAgKSxcbiAgICBtKCdkaXYuY2FyZC1mb290ZXInLCBbXG4gICAgICBtKExpbmssIHsgY2xhc3NOYW1lOiAnY29tbWVudC1hdXRob3InLCB0bzogdXRpbHMuZ2V0TGlua1RvVXNlclByb2ZpbGUoY29tbWVudC5hdXRob3IudXNlcm5hbWUpIH0sXG4gICAgICAgIG0oJ2ltZy5jb21tZW50LWF1dGhvci1pbWcnLCB7IHNyYzogY29tbWVudC5hdXRob3IuaW1hZ2UgfSlcbiAgICAgICksXG4gICAgICBtKCdzcGFuJywgbS50cnVzdCgnJm5ic3A7ICcpKSxcbiAgICAgIG0oTGluaywgeyBjbGFzc05hbWU6ICdjb21tZW50LWF1dGhvcicsIHRvOiB1dGlscy5nZXRMaW5rVG9Vc2VyUHJvZmlsZShjb21tZW50LmF1dGhvci51c2VybmFtZSkgfSxcbiAgICAgICAgY29tbWVudC5hdXRob3IudXNlcm5hbWVcbiAgICAgICksXG4gICAgICBtKCdzcGFuLmRhdGUtcG9zdGVkJywgdXRpbHMuZm9ybWF0RGF0ZShjb21tZW50LmNyZWF0ZWRBdCwgdXRpbHMuZGF0ZUZvcm1hdHMuREVGQVVMVF9XSVRIX1RJTUUpKVxuICAgIF0pXG4gIF0pO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgTGluayA9IHJlcXVpcmUoJy4vTGluaycpO1xudmFyIE5ld0NvbW1lbnRGb3JtID0gcmVxdWlyZSgnLi9OZXdDb21tZW50Rm9ybScpO1xudmFyIENvbW1lbnQgPSByZXF1aXJlKCcuL0NvbW1lbnQnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHZhciBjb21tZW50cyA9IHZub2RlLmF0dHJzLmNvbW1lbnRzLmRhdGEgfHwgW107XG4gIHZhciBoZWFkZXIgPSBtKCdwJywgW1xuICAgIG0oTGluaywgeyB0bzogJy9sb2dpbicgfSwgJ1NpZ24gaW4nKSxcbiAgICBtKCdzcGFuJywgJyBvciAnKSxcbiAgICBtKExpbmssIHsgdG86ICcvcmVnaXN0ZXInIH0sICdTaWduIHVwJyksXG4gICAgbSgnc3BhbicsICcgdG8gYWRkIGNvbW1lbnRzIG9uIHRoaXMgYXJ0aWNsZS4nKVxuICBdKTtcbiAgdmFyIGJvZHkgPSBudWxsO1xuXG4gIGlmICh2bm9kZS5hdHRycy5jdXJyZW50VXNlcikge1xuICAgIGhlYWRlciA9IG0oTmV3Q29tbWVudEZvcm0pO1xuICB9XG5cbiAgaWYgKHZub2RlLmF0dHJzLmNvbW1lbnRzLmlzTG9hZGluZykge1xuICAgIGJvZHkgPSBtKCdkaXYnLCAnTG9hZGluZy4uLicpO1xuICB9XG5cbiAgaWYgKGNvbW1lbnRzKSB7XG4gICAgYm9keSA9IGNvbW1lbnRzLm1hcChmdW5jdGlvbiAoY29tbWVudCkge1xuICAgICAgcmV0dXJuIG0oQ29tbWVudCwgeyBjb21tZW50OiBjb21tZW50LCBrZXk6IGNvbW1lbnQuaWQgfSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gbSgnZGl2LmNvbW1lbnRzJywgW1xuICAgIGhlYWRlcixcbiAgICBib2R5XG4gIF0pO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcblxuXG5mdW5jdGlvbiBzZXRDdXJyZW50bHlBY3RpdmVBcnRpY2xlcyh2bm9kZSwgdHlwZSkge1xuICB2YXIgcGF5bG9hZCA9IHtcbiAgICB0eXBlOiB0eXBlXG4gIH07XG5cbiAgc3dpdGNoICh0eXBlLm5hbWUpIHtcbiAgICBjYXNlIGRvbWFpbi5zdG9yZS5hcnRpY2xlTGlzdFR5cGVzLlVTRVJfRkFWT1JJVEVELm5hbWU6XG4gICAgICBwYXlsb2FkLmF1dGhvciA9ICcnO1xuICAgICAgcGF5bG9hZC5mYXZvcml0ZWQgPSB2bm9kZS5zdGF0ZS51c2VybmFtZTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBkb21haW4uc3RvcmUuYXJ0aWNsZUxpc3RUeXBlcy5VU0VSX09XTkVELm5hbWU6XG4gICAgICBwYXlsb2FkLmF1dGhvciA9IHZub2RlLnN0YXRlLnVzZXJuYW1lO1xuICAgICAgcGF5bG9hZC5mYXZvcml0ZWQgPSAnJztcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgZG9tYWluLmFjdGlvbnMuc2V0Q3VycmVudGx5QWN0aXZlQXJ0aWNsZXMocGF5bG9hZCk7XG59XG5cblxuZnVuY3Rpb24gb25MaW5rQ2xpY2sodm5vZGUsIHR5cGUsIGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIHNldEN1cnJlbnRseUFjdGl2ZUFydGljbGVzKHZub2RlLCB0eXBlKTtcbn1cblxuXG5mdW5jdGlvbiBidWlsZExpbmsodm5vZGUsIGxpbmtUeXBlLCBjdXJyZW50VHlwZSkge1xuICB2YXIgbGlua0NsYXNzTmFtZSA9IGxpbmtUeXBlLm5hbWUgPT09IGN1cnJlbnRUeXBlLm5hbWUgPyAnLmFjdGl2ZScgOiAnJztcblxuICByZXR1cm4gbSgnbGkubmF2LWl0ZW0nLFxuICAgIG0oJ2EubmF2LWxpbmsnICsgbGlua0NsYXNzTmFtZSwge1xuICAgICAgaHJlZjogJycsIG9uY2xpY2s6IG9uTGlua0NsaWNrLmJpbmQobnVsbCwgdm5vZGUsIGxpbmtUeXBlKVxuICAgIH0sIGxpbmtUeXBlLmxhYmVsKVxuICApO1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCh2bm9kZSkge1xuICBjb25zb2xlLmxvZygndm5vZGUuYXR0cnMuY3VycmVudFR5cGUnLCB2bm9kZS5hdHRycy5jdXJyZW50VHlwZSk7XG4gIHNldEN1cnJlbnRseUFjdGl2ZUFydGljbGVzKHZub2RlLCB2bm9kZS5hdHRycy5saW5rVHlwZXNbMF0pO1xufVxuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcbiAgdmFyIGN1cnJlbnRUeXBlID0gdm5vZGUuYXR0cnMuY3VycmVudFR5cGUgPyB2bm9kZS5hdHRycy5jdXJyZW50VHlwZSA6ICcnO1xuICB2YXIgbGlua1R5cGVzID0gdm5vZGUuYXR0cnMubGlua1R5cGVzID8gdm5vZGUuYXR0cnMubGlua1R5cGVzIDogW107XG4gIHZub2RlLnN0YXRlLnVzZXJuYW1lID0gdm5vZGUuYXR0cnMudXNlcm5hbWUgPyB2bm9kZS5hdHRycy51c2VybmFtZSA6ICcnO1xuXG4gIHJldHVybiBtKCdkaXYuZmVlZC10b2dnbGUnLFxuICAgIG0oJ3VsLm5hdi5uYXYtcGlsbHMub3V0bGluZS1hY3RpdmUnLCBsaW5rVHlwZXMubWFwKGZ1bmN0aW9uIChsaW5rVHlwZSkge1xuICAgICAgcmV0dXJuIGJ1aWxkTGluayh2bm9kZSwgbGlua1R5cGUsIGN1cnJlbnRUeXBlKTtcbiAgICB9KSlcbiAgKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG9uaW5pdDogb25pbml0LFxuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcbiAgdmFyIG9uY2xpY2sgPSB2bm9kZS5hdHRycy5vbmNsaWNrID8gdm5vZGUuYXR0cnMub25jbGljayA6IG51bGw7XG5cbiAgcmV0dXJuIG0oJ2EnLCB7IGNsYXNzTmFtZTogdm5vZGUuYXR0cnMuY2xhc3NOYW1lLCBocmVmOiB2bm9kZS5hdHRycy50bywgb25jcmVhdGU6IG0ucm91dGUubGluaywgb251cGRhdGU6IG0ucm91dGUubGluaywgb25jbGljazogb25jbGljayB9LCB2bm9kZS5jaGlsZHJlbik7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcbiAgdmFyIGVycm9ycyA9IHZub2RlLmF0dHJzLmVycm9ycztcblxuICBpZiAoZXJyb3JzKSB7XG4gICAgcmV0dXJuIG0oJ3VsLmVycm9yLW1lc3NhZ2VzJyxcbiAgICAgIE9iamVjdC5rZXlzKGVycm9ycykubWFwKGZ1bmN0aW9uIChlcnJvcktleSkge1xuICAgICAgICByZXR1cm4gbSgnbGknLCB7IGtleTogZXJyb3JLZXkgfSwgZXJyb3JLZXkgKyAnICcgKyBlcnJvcnNbZXJyb3JLZXldKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBMaW5rID0gcmVxdWlyZSgnLi9MaW5rJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuICB2YXIgY3VycmVudFVzZXIgPSB2bm9kZS5hdHRycy5jdXJyZW50VXNlciA/IHZub2RlLmF0dHJzLmN1cnJlbnRVc2VyIDoge1xuICAgIHVzZXJuYW1lOiAnJ1xuICB9O1xuXG4gIHZhciBhbGxMaW5rcyA9IHtcbiAgICBob21lOiB7IHJvdXRlOiAnLycsIGxhYmVsOiAnSG9tZScgfSxcbiAgICBsb2dpbjogeyByb3V0ZTogJy9sb2dpbicsIGxhYmVsOiAnU2lnbiBpbicgfSxcbiAgICByZWdpc3RlcjogeyByb3V0ZTogJy9yZWdpc3RlcicsIGxhYmVsOiAnU2lnbiB1cCcgfSxcbiAgICBlZGl0b3I6IHsgcm91dGU6ICcvZWRpdG9yJywgbGFiZWw6ICc8aSBjbGFzcz1cImlvbi1jb21wb3NlXCI+PC9pPiBOZXcgQXJ0aWNsZScgfSxcbiAgICBzZXR0aW5nczogeyByb3V0ZTogJy9zZXR0aW5ncycsIGxhYmVsOiAnPGkgY2xhc3M9XCJpb24tZ2Vhci1hXCI+PC9pPiBTZXR0aW5ncycgfSxcbiAgICB1c2VyOiB7IHJvdXRlOiAnL0AnICsgY3VycmVudFVzZXIudXNlcm5hbWUsIGxhYmVsOiAnPGltZyBjbGFzcz1cInVzZXItcGljXCIgc3JjPVwiJyArIHV0aWxzLmdldFVzZXJJbWFnZU9yRGVmYXVsdChjdXJyZW50VXNlcikgKyAnXCIgLz4gJyArIGN1cnJlbnRVc2VyLnVzZXJuYW1lIH1cbiAgfTtcblxuICB2YXIgbGlua3NGb3JHdWVzdCA9IFtcbiAgICBhbGxMaW5rcy5ob21lLFxuICAgIGFsbExpbmtzLmxvZ2luLFxuICAgIGFsbExpbmtzLnJlZ2lzdGVyXG4gIF07XG5cbiAgdmFyIGxpbmtzRm9yTWVtYmVyID0gW1xuICAgIGFsbExpbmtzLmhvbWUsXG4gICAgYWxsTGlua3MuZWRpdG9yLFxuICAgIGFsbExpbmtzLnNldHRpbmdzLFxuICAgIGFsbExpbmtzLnVzZXJcbiAgXTtcblxuXG4gIHZhciBsaW5rc1RvRGlzcGxheSA9IGxpbmtzRm9yR3Vlc3Q7XG4gIGlmIChjdXJyZW50VXNlci51c2VybmFtZSkge1xuICAgIGxpbmtzVG9EaXNwbGF5ID0gbGlua3NGb3JNZW1iZXI7XG4gIH1cblxuICByZXR1cm4gbSgndWwnLCB7IGNsYXNzTmFtZTogdm5vZGUuYXR0cnMuY2xhc3NOYW1lIH0sXG4gICAgbGlua3NUb0Rpc3BsYXkubWFwKGZ1bmN0aW9uIChsaW5rKSB7XG4gICAgICB2YXIgY2xhc3NOYW1lID0gJ25hdi1saW5rJztcblxuICAgICAgaWYgKG0ucm91dGUuZ2V0KCkgPT09IGxpbmsucm91dGUpIHtcbiAgICAgICAgY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG0oJ2xpLm5hdi1pdGVtJywgbShMaW5rLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCB0bzogbGluay5yb3V0ZSB9LCBtLnRydXN0KGxpbmsubGFiZWwpKSk7XG4gICAgfSlcbiAgKTtcblxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgc3RhdGUgPSB7XG4gIGZuX3N1Ym1pdDogbnVsbCxcbiAgZm9ybURhdGE6IHt9XG59O1xuXG5cbmZ1bmN0aW9uIHNldElucHV0VmFsdWUobmFtZSwgdmFsdWUpIHtcbiAgc3RhdGUuZm9ybURhdGFbbmFtZV0gPSB2YWx1ZTtcbn1cblxuXG5mdW5jdGlvbiBvblN1Ym1pdEJ1dHRvbkNsaWNrKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIHN0YXRlLmZuX3N1Ym1pdChzdGF0ZS5mb3JtRGF0YSk7XG59XG5cblxuZnVuY3Rpb24gb25pbml0KHZub2RlKSB7XG4gIHNldHVwRm9ybURhdGEodm5vZGUuYXR0cnMuYXJ0aWNsZSk7XG5cbiAgc3RhdGUuZm5fc3VibWl0ID0gdm5vZGUuYXR0cnMuZm5fc3VibWl0O1xufVxuXG5cbmZ1bmN0aW9uIHNldHVwRm9ybURhdGEoZGF0YSkge1xuICB2YXIgYXJ0aWNsZURhdGEgPSBkYXRhID8gZGF0YSA6IHtcbiAgICB0aXRsZTogJycsXG4gICAgZGVzY3JpcHRpb246ICcnLFxuICAgIGJvZHk6ICcnLFxuICAgIHRhZ0xpc3Q6ICcnXG4gIH07XG5cbiAgc3RhdGUuZm9ybURhdGEgPSB7XG4gICAgdGl0bGU6IGFydGljbGVEYXRhLnRpdGxlLFxuICAgIGRlc2NyaXB0aW9uOiBhcnRpY2xlRGF0YS5kZXNjcmlwdGlvbixcbiAgICBib2R5OiBhcnRpY2xlRGF0YS5ib2R5LFxuICAgIHRhZ0xpc3Q6IGFydGljbGVEYXRhLnRhZ0xpc3RcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiBvbmJlZm9yZXVwZGF0ZSh2bm9kZSwgdm5vZGVPbGQpIHtcbiAgaWYgKHZub2RlT2xkLmF0dHJzLmFydGljbGUgIT09IHZub2RlLmF0dHJzLmFydGljbGUpIHtcbiAgICBzZXR1cEZvcm1EYXRhKHZub2RlLmF0dHJzLmFydGljbGUpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXG4gIHJldHVybiBtKCdmb3JtJyxcbiAgICBtKCdmaWVsZHNldCcsXG4gICAgICBbXG4gICAgICAgIG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc2V0SW5wdXRWYWx1ZS5iaW5kKG51bGwsICd0aXRsZScpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLnRpdGxlLCB0eXBlOiAndGV4dCcsIGF1dG9jb21wbGV0ZTogJ29mZicsIHBsYWNlaG9sZGVyOiAnQXJ0aWNsZSBUaXRsZScsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1N1Ym1pdEJ1c3kgfSlcbiAgICAgICAgKSxcbiAgICAgICAgbSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG4gICAgICAgICAgbSgnaW5wdXQuZm9ybS1jb250cm9sJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAnZGVzY3JpcHRpb24nKSksIHZhbHVlOiBzdGF0ZS5mb3JtRGF0YS5kZXNjcmlwdGlvbiwgdHlwZTogJ3RleHQnLCBhdXRvY29tcGxldGU6ICdvZmYnLCBwbGFjZWhvbGRlcjogJ1doYXRcXCdzIHRoaXMgYXJ0aWNsZSBhYm91dD8nLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNTdWJtaXRCdXN5IH0pXG4gICAgICAgICksXG4gICAgICAgIG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ3RleHRhcmVhLmZvcm0tY29udHJvbCcsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ2JvZHknKSksIHZhbHVlOiBzdGF0ZS5mb3JtRGF0YS5ib2R5LCBhdXRvY29tcGxldGU6ICdvZmYnLCByb3dzOiAnOCcsIHBsYWNlaG9sZGVyOiAnV3JpdGUgeW91ciBhcnRpY2xlIChpbiBtYXJrZG93biknLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNTdWJtaXRCdXN5IH0pXG4gICAgICAgICksXG4gICAgICAgIG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ3RhZ0xpc3QnKSksIHZhbHVlOiBzdGF0ZS5mb3JtRGF0YS50YWdMaXN0LCB0eXBlOiAndGV4dCcsIGF1dG9jb21wbGV0ZTogJ29mZicsIHBsYWNlaG9sZGVyOiAnRW50ZXIgdGFncycsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1N1Ym1pdEJ1c3kgfSlcbiAgICAgICAgKSxcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXByaW1hcnkucHVsbC14cy1yaWdodCcsIHsgb25jbGljazogb25TdWJtaXRCdXR0b25DbGljaywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzU3VibWl0QnVzeSB9LCAnUHVibGlzaCBBcnRpY2xlJylcbiAgICAgIF1cbiAgICApXG4gICk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvbmluaXQ6IG9uaW5pdCxcbiAgb25iZWZvcmV1cGRhdGU6IG9uYmVmb3JldXBkYXRlLFxuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5cbnZhciBzdGF0ZSA9IHtcbiAgZm9ybURhdGE6IHtcbiAgICBhcnRpY2xlU2x1ZzogJycsXG4gICAgYm9keTogJydcbiAgfVxufTtcblxuXG5mdW5jdGlvbiBzZXRJbnB1dFZhbHVlKG5hbWUsIHZhbHVlKSB7XG4gIHN0YXRlLmZvcm1EYXRhW25hbWVdID0gdmFsdWU7XG59XG5cblxuZnVuY3Rpb24gaXNGb3JtU3VibWlzc2lvbkJ1c3koKSB7XG4gIHJldHVybiBkb21haW4uc3RvcmUuaXNBcnRpY2xlQ29tbWVudENyZWF0aW9uQnVzeTtcbn1cblxuZnVuY3Rpb24gaXNGb3JtU3VibWl0RGlzYWJsZWQoKSB7XG4gIHJldHVybiBzdGF0ZS5mb3JtRGF0YS5ib2R5ID09PSAnJyB8fCBkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlLmRhdGEgPT09IG51bGwgfHwgaXNGb3JtU3VibWlzc2lvbkJ1c3koKSA9PT0gdHJ1ZTtcbn1cblxuXG5mdW5jdGlvbiBvbkZvcm1TdWJtaXQoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgc2V0SW5wdXRWYWx1ZSgnYXJ0aWNsZVNsdWcnLCBkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlLmRhdGEuc2x1Zyk7XG4gIGRvbWFpbi5hY3Rpb25zLmNyZWF0ZUFydGljbGVDb21tZW50KHN0YXRlLmZvcm1EYXRhKTtcbiAgc2V0SW5wdXRWYWx1ZSgnYm9keScsICcnKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuICByZXR1cm4gbSgnZGl2JywgW1xuICAgIG0oJ2Zvcm0uY2FyZCBjb21tZW50LWZvcm0nLCB7IGRpc2FibGVkOiBpc0Zvcm1TdWJtaXNzaW9uQnVzeSgpLCBvbnN1Ym1pdDogb25Gb3JtU3VibWl0IH0sXG4gICAgICBtKCdkaXYuY2FyZC1ibG9jaycsXG4gICAgICAgIG0oJ3RleHRhcmVhLmZvcm0tY29udHJvbCcsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ2JvZHknKSksIHZhbHVlOiBzdGF0ZS5mb3JtRGF0YS5ib2R5LCBhdXRvY29tcGxldGU6ICdvZmYnLCBkaXNhYmxlZDogaXNGb3JtU3VibWlzc2lvbkJ1c3koKSwgcm93czogJzMnLCBwbGFjZWhvbGRlcjogJ1dyaXRlIGEgY29tbWVudC4uLicgfSlcbiAgICAgICksXG4gICAgICBtKCdkaXYuY2FyZC1mb290ZXInLCBbXG4gICAgICAgIG0oJ2ltZy5jb21tZW50LWF1dGhvci1pbWcnLCB7IHNyYzogdXRpbHMuZ2V0VXNlckltYWdlT3JEZWZhdWx0KGRvbWFpbi5zdG9yZS51c2VyKSB9KSxcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLXByaW1hcnknLCB7IHR5cGU6ICdzdWJtaXQnLCBkaXNhYmxlZDogaXNGb3JtU3VibWl0RGlzYWJsZWQoKSB9LCAnUG9zdCBDb21tZW50JylcbiAgICAgIF0pXG4gICAgKVxuICBdKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIExpbmsgPSByZXF1aXJlKCcuL0xpbmsnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHZhciB0b3RhbFBhZ2VzID0gdm5vZGUuYXR0cnMudG90YWxQYWdlcyB8fCAxO1xuICB2YXIgY3VycmVudFBhZ2UgPSB2bm9kZS5hdHRycy5jdXJyZW50UGFnZSB8fCAxO1xuICB2YXIgcGFnZUxpc3QgPSBBcnJheS5hcHBseShudWxsLCBBcnJheSh0b3RhbFBhZ2VzKSk7XG5cbiAgLy8gY29uc29sZS5sb2codm5vZGUuYXR0cnMpO1xuXG4gIHJldHVybiBtKCduYXYnLFxuICAgIG0oJ3VsLnBhZ2luYXRpb24nLFxuICAgICAgcGFnZUxpc3QubWFwKGZ1bmN0aW9uICh0YWcsIGkpIHtcbiAgICAgICAgdmFyIGFjdGl2ZUNsYXNzTmFtZSA9ICcnO1xuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZSA9PT0gKGkgKyAxKSkge1xuICAgICAgICAgIGFjdGl2ZUNsYXNzTmFtZSA9ICcuYWN0aXZlJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtKCdsaS5wYWdlLWl0ZW0nICsgYWN0aXZlQ2xhc3NOYW1lLCB7IGtleTogaSB9LFxuICAgICAgICAgIG0oTGluaywge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAncGFnZS1saW5rJyxcbiAgICAgICAgICAgIHRvOiAnJyxcbiAgICAgICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgdm5vZGUuYXR0cnMuZm5fb25JdGVtQ2xpY2soaSArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIFN0cmluZyhpICsgMSkpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgIClcbiAgKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIFRhZ0xpc3QgPSByZXF1aXJlKCcuL1RhZ0xpc3QnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHZhciB0YWdzQ29udGVudCA9IG0oJ2RpdicsICdMb2FkaW5nIFRhZ3MuLi4nKTtcblxuICBpZiAodm5vZGUuYXR0cnMuaXNMb2FkaW5nID09PSBmYWxzZSkge1xuICAgIHRhZ3NDb250ZW50ID0gbShUYWdMaXN0LCB7IGxpc3Q6IHZub2RlLmF0dHJzLmxpc3QgfSk7XG4gIH1cblxuICByZXR1cm4gbSgnZGl2JywgW1xuICAgIG0oJ3AnLCAnUG9wdWxhciBUYWdzJyksXG4gICAgdGFnc0NvbnRlbnRcbiAgXSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcbiAgcmV0dXJuIG0oJ3NlY3Rpb24nLCB2bm9kZS5jaGlsZHJlbik7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBMaW5rID0gcmVxdWlyZSgnLi9MaW5rJyk7XG52YXIgc3R5bGVzID0ge1xuICBPVVRMSU5FOiAnT1VUTElORSdcbn07XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuICB2YXIgbGlzdCA9IHZub2RlLmF0dHJzLmxpc3QgPyB2bm9kZS5hdHRycy5saXN0IDogW107XG4gIHZhciBsaW5rQ2xhc3NOYW1lID0gJ3RhZy1kZWZhdWx0IHRhZy1waWxsJztcblxuICBpZiAodm5vZGUuYXR0cnMuc3R5bGUgPT09IHN0eWxlcy5PVVRMSU5FKSB7XG4gICAgbGlua0NsYXNzTmFtZSArPSAnIHRhZy1vdXRsaW5lJztcbiAgfVxuXG4gIHJldHVybiBtKCd1bC50YWctbGlzdCcsXG4gICAgbGlzdC5tYXAoZnVuY3Rpb24gKHRhZykge1xuICAgICAgcmV0dXJuIG0oJ2xpJyxcbiAgICAgICAgbShMaW5rLCB7XG4gICAgICAgICAgY2xhc3NOYW1lOiBsaW5rQ2xhc3NOYW1lLCBrZXk6IHRhZywgdG86ICcnLCBvbmNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGFnKVxuICAgICAgKTtcbiAgICB9KVxuICApO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3R5bGVzOiBzdHlsZXMsXG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuICB2YXIgYWN0aW9uID0gdm5vZGUuYXR0cnMuYWN0aW9uIHx8IGRvbWFpbi5hY3Rpb25zLmZvbGxvd1VzZXIuYmluZChudWxsLCB2bm9kZS5hdHRycy51c2VybmFtZSk7XG4gIHZhciBsYWJlbCA9IHZub2RlLmF0dHJzLnVzZXJuYW1lID8gJyBGb2xsb3cgJyArIHZub2RlLmF0dHJzLnVzZXJuYW1lIDogJyc7XG5cbiAgcmV0dXJuIFtcbiAgICBtKCdzcGFuJyxcbiAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1zZWNvbmRhcnknLCB7IG9uY2xpY2s6IGZ1bmN0aW9uICgpIHsgYWN0aW9uKCk7IH0gfSwgW1xuICAgICAgICBtKCdpLmlvbi1wbHVzLXJvdW5kJyksIG0oJ3NwYW4nLCBsYWJlbClcbiAgICAgIF0pXG4gICAgKVxuICBdO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgVXNlckZvbGxvd0J1dHRvbiA9IHJlcXVpcmUoJy4vVXNlckZvbGxvd0J1dHRvbicpO1xudmFyIFVzZXJVbmZvbGxvd0J1dHRvbiA9IHJlcXVpcmUoJy4vVXNlclVuZm9sbG93QnV0dG9uJyk7XG5cblxuZnVuY3Rpb24gZ2V0QWN0aW9uQnV0dG9uKGlzRm9sbG93aW5nLCB1c2VybmFtZSwgbG9nZ2VkSW5Vc2VybmFtZSkge1xuXG4gIGlmICghbG9nZ2VkSW5Vc2VybmFtZSkge1xuICAgIHJldHVybiBtKFVzZXJGb2xsb3dCdXR0b24sIHsgdXNlcm5hbWU6IHVzZXJuYW1lLCBhY3Rpb246IG0ucm91dGUuc2V0LmJpbmQobnVsbCwgJy9yZWdpc3RlcicpIH0pO1xuICB9XG5cbiAgaWYgKHVzZXJuYW1lID09PSBsb2dnZWRJblVzZXJuYW1lKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoaXNGb2xsb3dpbmcgPT09IHRydWUpIHtcbiAgICByZXR1cm4gbShVc2VyVW5mb2xsb3dCdXR0b24sIHsgdXNlcm5hbWU6IHVzZXJuYW1lIH0pO1xuICB9XG5cbiAgcmV0dXJuIG0oVXNlckZvbGxvd0J1dHRvbiwgeyB1c2VybmFtZTogdXNlcm5hbWUgfSk7XG59XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuICByZXR1cm4gZ2V0QWN0aW9uQnV0dG9uKHZub2RlLmF0dHJzLmlzRm9sbG93aW5nLCB2bm9kZS5hdHRycy51c2VybmFtZSwgdm5vZGUuYXR0cnMubG9nZ2VkSW5Vc2VybmFtZSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBVc2VyRm9sbG93VW5mb2xsb3dCdXR0b24gPSByZXF1aXJlKCcuL1VzZXJGb2xsb3dVbmZvbGxvd0J1dHRvbicpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcbiAgdmFyIHNlbGVjdGVkVXNlciA9IHZub2RlLmF0dHJzLnNlbGVjdGVkVXNlciA/IHZub2RlLmF0dHJzLnNlbGVjdGVkVXNlciA6IHtcbiAgICBiaW86ICcnLFxuICAgIGltYWdlOiAnJyxcbiAgICB1c2VybmFtZTogJydcbiAgfTtcblxuICB2YXIgbG9nZ2VkSW5Vc2VyID0gdm5vZGUuYXR0cnMubG9nZ2VkSW5Vc2VyID8gdm5vZGUuYXR0cnMubG9nZ2VkSW5Vc2VyIDoge1xuICAgIHVzZXJuYW1lOiAnJ1xuICB9O1xuXG4gIHJldHVybiBtKCcudXNlci1pbmZvJyxcbiAgICBtKCcuY29udGFpbmVyJyxcbiAgICAgIFtcbiAgICAgICAgbSgnLnJvdycsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgbSgnLmNvbC14cy0xMiBjb2wtbWQtMTAgb2Zmc2V0LW1kLTEnLCBbXG4gICAgICAgICAgICAgIG0oJ2ltZy51c2VyLWltZycsIHsgc3JjOiBzZWxlY3RlZFVzZXIuaW1hZ2UgfSksXG4gICAgICAgICAgICAgIG0oJ2g0Jywgc2VsZWN0ZWRVc2VyLnVzZXJuYW1lIHx8ICcuLi4nKSxcbiAgICAgICAgICAgICAgbSgncCcsIHNlbGVjdGVkVXNlci5iaW8pLFxuICAgICAgICAgICAgICBtKFVzZXJGb2xsb3dVbmZvbGxvd0J1dHRvbiwgeyBpc0ZvbGxvd2luZzogc2VsZWN0ZWRVc2VyLmZvbGxvd2luZywgdXNlcm5hbWU6IHNlbGVjdGVkVXNlci51c2VybmFtZSwgbG9nZ2VkSW5Vc2VybmFtZTogbG9nZ2VkSW5Vc2VyLnVzZXJuYW1lIH0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICBdXG4gICAgICAgIClcbiAgICAgIF1cbiAgICApXG4gICk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xuXG5cbnZhciBzdGF0ZSA9IHtcbiAgZW1haWw6ICcnLFxuICBwYXNzd29yZDogJycsXG4gIHNldEVtYWlsOiBmdW5jdGlvbiAodikgeyBzdGF0ZS5lbWFpbCA9IHY7IH0sXG4gIHNldFBhc3N3b3JkOiBmdW5jdGlvbiAodikgeyBzdGF0ZS5wYXNzd29yZCA9IHY7IH1cbn07XG5cblxuZnVuY3Rpb24gb25Mb2dpbkJ1dHRvbkNsaWNrKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGRvbWFpbi5hY3Rpb25zLmF0dGVtcHRVc2VyTG9naW4oc3RhdGUuZW1haWwsIHN0YXRlLnBhc3N3b3JkKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHJldHVybiBtKCdmb3JtJyxcbiAgICBtKCdmaWVsZHNldCcsXG4gICAgICBbXG4gICAgICAgIG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc3RhdGUuc2V0RW1haWwpLCB2YWx1ZTogc3RhdGUuZW1haWwsIHR5cGU6ICdlbWFpbCcsIGF1dG9jb21wbGV0ZTogJ29mZicsIHBsYWNlaG9sZGVyOiAnRW1haWwnLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyTG9naW5CdXN5IH0pXG4gICAgICAgICksXG4gICAgICAgIG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc3RhdGUuc2V0UGFzc3dvcmQpLCB2YWx1ZTogc3RhdGUucGFzc3dvcmQsIHR5cGU6ICdwYXNzd29yZCcsIGF1dG9jb21wbGV0ZTogJ29mZicsIHBsYWNlaG9sZGVyOiAnUGFzc3dvcmQnLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyTG9naW5CdXN5IH0pXG4gICAgICAgICksXG4gICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLWxnLmJ0bi1wcmltYXJ5LnB1bGwteHMtcmlnaHQnLCB7IG9uY2xpY2s6IG9uTG9naW5CdXR0b25DbGljaywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlckxvZ2luQnVzeSB9LCAnU2lnbiBpbicpXG4gICAgICBdXG4gICAgKVxuICApO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgc3RhdGUgPSB7XG4gIGZuX3JlZ2lzdGVyVXNlcjogbnVsbCxcbiAgZm9ybURhdGE6IHt9XG59O1xuXG5cbmZ1bmN0aW9uIHNldElucHV0VmFsdWUobmFtZSwgdmFsdWUpIHtcbiAgc3RhdGUuZm9ybURhdGFbbmFtZV0gPSB2YWx1ZTtcbn1cblxuXG5mdW5jdGlvbiBvblJlZ2lzdGVyQnV0dG9uQ2xpY2soZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgc3RhdGUuZm5fcmVnaXN0ZXJVc2VyKHN0YXRlLmZvcm1EYXRhKTtcbn1cblxuXG5mdW5jdGlvbiBvbmluaXQodm5vZGUpIHtcbiAgc3RhdGUuZm9ybURhdGEgPSB7XG4gICAgZW1haWw6ICcnLFxuICAgIHBhc3N3b3JkOiAnJyxcbiAgICB1c2VybmFtZTogJydcbiAgfTtcblxuICBzdGF0ZS5mbl9yZWdpc3RlclVzZXIgPSB2bm9kZS5hdHRycy5mbl9yZWdpc3RlclVzZXI7XG59XG5cblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG4gIHJldHVybiBtKCdmb3JtJyxcbiAgICBtKCdmaWVsZHNldCcsXG4gICAgICBbXG4gICAgICAgIG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc2V0SW5wdXRWYWx1ZS5iaW5kKG51bGwsICd1c2VybmFtZScpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLnVzZXJuYW1lLCB0eXBlOiAndGV4dCcsIGF1dG9jb21wbGV0ZTogJ29mZicsIHBsYWNlaG9sZGVyOiAnVXNlcm5hbWUnLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyUmVnaXN0cmF0aW9uQnVzeSB9KVxuICAgICAgICApLFxuICAgICAgICBtKCdmaWVsZHNldC5mb3JtLWdyb3VwJyxcbiAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wuZm9ybS1jb250cm9sLWxnJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAnZW1haWwnKSksIHZhbHVlOiBzdGF0ZS5mb3JtRGF0YS5lbWFpbCwgdHlwZTogJ2VtYWlsJywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdFbWFpbCcsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJSZWdpc3RyYXRpb25CdXN5IH0pXG4gICAgICAgICksXG4gICAgICAgIG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc2V0SW5wdXRWYWx1ZS5iaW5kKG51bGwsICdwYXNzd29yZCcpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLnBhc3N3b3JkLCB0eXBlOiAncGFzc3dvcmQnLCBhdXRvY29tcGxldGU6ICdvZmYnLCBwbGFjZWhvbGRlcjogJ1Bhc3N3b3JkJywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlclJlZ2lzdHJhdGlvbkJ1c3kgfSlcbiAgICAgICAgKSxcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXByaW1hcnkucHVsbC14cy1yaWdodCcsIHsgb25jbGljazogb25SZWdpc3RlckJ1dHRvbkNsaWNrLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyUmVnaXN0cmF0aW9uQnVzeSB9LCAnU2lnbiB1cCcpXG4gICAgICBdXG4gICAgKVxuICApO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb25pbml0OiBvbmluaXQsXG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIHN0YXRlID0ge1xuICBmbl91cGRhdGVVc2VyU2V0dGluZ3M6IG51bGwsXG4gIGZuX2xvZ1VzZXJPdXQ6IG51bGwsXG4gIGZvcm1EYXRhOiB7fVxufTtcblxuXG5mdW5jdGlvbiBzZXRJbnB1dFZhbHVlKG5hbWUsIHZhbHVlKSB7XG4gIHN0YXRlLmZvcm1EYXRhW25hbWVdID0gdmFsdWU7XG59XG5cblxuZnVuY3Rpb24gb25TdWJtaXRCdXR0b25DbGljayhlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcblxuICBzdGF0ZS5mbl91cGRhdGVVc2VyU2V0dGluZ3Moc3RhdGUuZm9ybURhdGEpO1xufVxuXG5cbmZ1bmN0aW9uIG9uTG9nb3V0QnV0dG9uQ2xpY2soZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgc3RhdGUuZm5fbG9nVXNlck91dCgpO1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCh2bm9kZSkge1xuICBzZXR1cEZvcm1EYXRhKHZub2RlLmF0dHJzLmN1cnJlbnRVc2VyKTtcblxuICBzdGF0ZS5mbl91cGRhdGVVc2VyU2V0dGluZ3MgPSB2bm9kZS5hdHRycy5mbl91cGRhdGVVc2VyU2V0dGluZ3M7XG4gIHN0YXRlLmZuX2xvZ1VzZXJPdXQgPSB2bm9kZS5hdHRycy5mbl9sb2dVc2VyT3V0O1xufVxuXG5cbmZ1bmN0aW9uIHNldHVwRm9ybURhdGEoZGF0YSkge1xuICB2YXIgdXNlckRhdGEgPSBkYXRhID8gZGF0YSA6IHtcbiAgICBiaW86ICcnLFxuICAgIGVtYWlsOiAnJyxcbiAgICBpbWFnZTogJycsXG4gICAgdXNlcm5hbWU6ICcnXG4gIH07XG5cbiAgc3RhdGUuZm9ybURhdGEgPSB7XG4gICAgYmlvOiB1c2VyRGF0YS5iaW8sXG4gICAgZW1haWw6IHVzZXJEYXRhLmVtYWlsLFxuICAgIGltYWdlOiB1c2VyRGF0YS5pbWFnZSxcbiAgICB1c2VybmFtZTogdXNlckRhdGEudXNlcm5hbWVcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiBvbmJlZm9yZXVwZGF0ZSh2bm9kZSwgdm5vZGVPbGQpIHtcbiAgaWYgKHZub2RlT2xkLmF0dHJzLmN1cnJlbnRVc2VyICE9PSB2bm9kZS5hdHRycy5jdXJyZW50VXNlcikge1xuICAgIHNldHVwRm9ybURhdGEodm5vZGUuYXR0cnMuY3VycmVudFVzZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXG4gIHJldHVybiBtKCdkaXYnLCBbXG4gICAgbSgnZm9ybScsXG4gICAgICBtKCdmaWVsZHNldCcsXG4gICAgICAgIFtcbiAgICAgICAgICBtKCdmaWVsZHNldC5mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbCcsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ2ltYWdlJykpLCB2YWx1ZTogc3RhdGUuZm9ybURhdGEuaW1hZ2UsIHR5cGU6ICd0ZXh0JywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdVUkwgb2YgcHJvZmlsZSBwaWN0dXJlJywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlclNldHRpbmdzVXBkYXRlQnVzeSB9KVxuICAgICAgICAgICksXG4gICAgICAgICAgbSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wuZm9ybS1jb250cm9sLWxnJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAndXNlcm5hbWUnKSksIHZhbHVlOiBzdGF0ZS5mb3JtRGF0YS51c2VybmFtZSwgdHlwZTogJ2VtYWlsJywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdVc2VybmFtZScsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3kgfSlcbiAgICAgICAgICApLFxuICAgICAgICAgIG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgbSgndGV4dGFyZWEuZm9ybS1jb250cm9sLmZvcm0tY29udHJvbC1sZycsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ2JpbycpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLmJpbywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcm93czogJzgnLCBwbGFjZWhvbGRlcjogJ1Nob3J0IGJpbyBhYm91dCB5b3UnLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyU2V0dGluZ3NVcGRhdGVCdXN5IH0pXG4gICAgICAgICAgKSxcbiAgICAgICAgICBtKCdmaWVsZHNldC5mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgIG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc2V0SW5wdXRWYWx1ZS5iaW5kKG51bGwsICdlbWFpbCcpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLmVtYWlsLCB0eXBlOiAnZW1haWwnLCBhdXRvY29tcGxldGU6ICdvZmYnLCBwbGFjZWhvbGRlcjogJ0VtYWlsJywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlclNldHRpbmdzVXBkYXRlQnVzeSB9KVxuICAgICAgICAgICksXG4gICAgICAgICAgbSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICBtKCdpbnB1dC5mb3JtLWNvbnRyb2wuZm9ybS1jb250cm9sLWxnJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAncGFzc3dvcmQnKSksIHZhbHVlOiBzdGF0ZS5mb3JtRGF0YS5wYXNzd29yZCwgdHlwZTogJ3Bhc3N3b3JkJywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdQYXNzd29yZCcsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3kgfSlcbiAgICAgICAgICApLFxuICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLWxnLmJ0bi1wcmltYXJ5LnB1bGwteHMtcmlnaHQnLCB7IG9uY2xpY2s6IG9uU3VibWl0QnV0dG9uQ2xpY2ssIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3kgfSwgJ1VwZGF0ZSBTZXR0aW5ncycpXG4gICAgICAgIF1cbiAgICAgIClcbiAgICApLFxuICAgIG0oJ2hyJyksXG4gICAgbSgnYnV0dG9uLmJ0bi5idG4tb3V0bGluZS1kYW5nZXInLCB7IG9uY2xpY2s6IG9uTG9nb3V0QnV0dG9uQ2xpY2ssIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3kgfSwgJ09yIGNsaWNrIGhlcmUgdG8gbG9nb3V0JylcbiAgXSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvbmluaXQ6IG9uaW5pdCxcbiAgb25iZWZvcmV1cGRhdGU6IG9uYmVmb3JldXBkYXRlLFxuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcbiAgdmFyIGFjdGlvbiA9IGRvbWFpbi5hY3Rpb25zLnVuZm9sbG93VXNlci5iaW5kKG51bGwsIHZub2RlLmF0dHJzLnVzZXJuYW1lKTtcbiAgdmFyIGxhYmVsID0gdm5vZGUuYXR0cnMudXNlcm5hbWUgPyAnIFVuZm9sbG93ICcgKyB2bm9kZS5hdHRycy51c2VybmFtZSA6ICcnO1xuXG4gIHJldHVybiBbXG4gICAgbSgnc3BhbicsXG4gICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tc2Vjb25kYXJ5JywgeyBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7IGFjdGlvbigpOyB9IH0sIFtcbiAgICAgICAgbSgnaS5pb24tbWludXMtcm91bmQnKSwgbSgnc3BhbicsIGxhYmVsKVxuICAgICAgXSlcbiAgICApXG4gIF07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBuYW1lID0gJ0xheW91dERlZmF1bHQnO1xuXG5cbnZhciBBcHBIZWFkZXIgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQXBwSGVhZGVyJyk7XG52YXIgU2NyZWVuQ29udGVudCA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9TY3JlZW5Db250ZW50Jyk7XG52YXIgQXBwRm9vdGVyID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0FwcEZvb3RlcicpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcbiAgcmV0dXJuIG0oJ2RpdicsIHsgY2xhc3NOYW1lOiBuYW1lIH0sXG4gICAgW1xuICAgICAgbShBcHBIZWFkZXIpLFxuICAgICAgbShTY3JlZW5Db250ZW50LCB7fSwgdm5vZGUuY2hpbGRyZW4pLFxuICAgICAgbShBcHBGb290ZXIpXG4gICAgXVxuICApO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBuYW1lID0gJ0xheW91dEhvbWUnO1xuXG5cbnZhciBBcHBIZWFkZXIgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQXBwSGVhZGVyJyk7XG52YXIgU2NyZWVuQ29udGVudCA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9TY3JlZW5Db250ZW50Jyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuICByZXR1cm4gbSgnZGl2Jywge1xuICAgIGNsYXNzTmFtZTogbmFtZVxuICB9LFxuICAgIFtcbiAgICAgIG0oQXBwSGVhZGVyKSxcbiAgICAgIG0oU2NyZWVuQ29udGVudCwge30sIHZub2RlLmNoaWxkcmVuKVxuICAgIF1cbiAgKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgTGF5b3V0RGVmYXVsdCA9IHJlcXVpcmUoJy4vbGF5b3V0cy9MYXlvdXREZWZhdWx0Jyk7XG52YXIgTGF5b3V0SG9tZSA9IHJlcXVpcmUoJy4vbGF5b3V0cy9MYXlvdXRIb21lJyk7XG5cblxudmFyIFNjcmVlbkhvbWUgPSByZXF1aXJlKCcuL3NjcmVlbnMvU2NyZWVuSG9tZScpO1xudmFyIFNjcmVlbkFydGljbGUgPSByZXF1aXJlKCcuL3NjcmVlbnMvU2NyZWVuQXJ0aWNsZScpO1xudmFyIFNjcmVlblVzZXJMb2dpbiA9IHJlcXVpcmUoJy4vc2NyZWVucy9TY3JlZW5Vc2VyTG9naW4nKTtcbnZhciBTY3JlZW5Vc2VyUmVnaXN0ZXIgPSByZXF1aXJlKCcuL3NjcmVlbnMvU2NyZWVuVXNlclJlZ2lzdGVyJyk7XG52YXIgU2NyZWVuVXNlclByb2ZpbGUgPSByZXF1aXJlKCcuL3NjcmVlbnMvU2NyZWVuVXNlclByb2ZpbGUnKTtcbnZhciBTY3JlZW5Vc2VyU2V0dGluZ3MgPSByZXF1aXJlKCcuL3NjcmVlbnMvU2NyZWVuVXNlclNldHRpbmdzJyk7XG52YXIgU2NyZWVuVXNlckZhdm9yaXRlcyA9IHJlcXVpcmUoJy4vc2NyZWVucy9TY3JlZW5Vc2VyRmF2b3JpdGVzJyk7XG52YXIgU2NyZWVuRWRpdG9yID0gcmVxdWlyZSgnLi9zY3JlZW5zL1NjcmVlbkVkaXRvcicpO1xuXG5cbnZhciByb3V0ZXMgPSB7XG4gICcvJzogYnVpbGRSb3V0ZShTY3JlZW5Ib21lLCBMYXlvdXRIb21lKSxcbiAgJy9hcnRpY2xlLzpzbHVnJzogYnVpbGRSb3V0ZShTY3JlZW5BcnRpY2xlKSxcbiAgJy9yZWdpc3Rlcic6IGJ1aWxkUm91dGUoU2NyZWVuVXNlclJlZ2lzdGVyKSxcbiAgJy9sb2dpbic6IGJ1aWxkUm91dGUoU2NyZWVuVXNlckxvZ2luKSxcbiAgJy9AOnVzZXJuYW1lJzogYnVpbGRSb3V0ZShTY3JlZW5Vc2VyUHJvZmlsZSksXG4gICcvQDp1c2VybmFtZS9mYXZvcml0ZXMnOiBidWlsZFJvdXRlKFNjcmVlblVzZXJGYXZvcml0ZXMpLFxuICAnL3NldHRpbmdzJzogYnVpbGRSb3V0ZShTY3JlZW5Vc2VyU2V0dGluZ3MpLFxuICAnL2VkaXRvcic6IGJ1aWxkUm91dGUoU2NyZWVuRWRpdG9yKSxcbiAgJy9lZGl0b3IvOnNsdWcnOiBidWlsZFJvdXRlKFNjcmVlbkVkaXRvcilcbn07XG5cblxuZnVuY3Rpb24gYnVpbGRSb3V0ZShzY3JlZW4sIGxheW91dCkge1xuICBsYXlvdXQgPSBsYXlvdXQgfHwgTGF5b3V0RGVmYXVsdDtcblxuICByZXR1cm4ge1xuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG0obGF5b3V0LCBtKHNjcmVlbikpO1xuICAgIH1cbiAgfTtcbn1cblxuXG5mdW5jdGlvbiBpbml0KCkge1xuICBtLnJvdXRlLnByZWZpeCgnPycpO1xuICBtLnJvdXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKSwgJy8nLCByb3V0ZXMpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBpbml0XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIEJhbm5lciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9CYW5uZXInKTtcbnZhciBBcnRpY2xlQmFubmVyID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0FydGljbGVCYW5uZXInKTtcbnZhciBBcnRpY2xlQ29udGVudCA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9BcnRpY2xlQ29udGVudCcpO1xudmFyIEFydGljbGVNZXRhQW5kQWN0aW9ucyA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9BcnRpY2xlTWV0YUFuZEFjdGlvbnMnKTtcbnZhciBDb21tZW50cyA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9Db21tZW50cycpO1xuXG5cbnZhciBzdGF0ZSA9IHtcbiAgc2x1ZzogJydcbn07XG5cblxuZnVuY3Rpb24gZ2V0QXJ0aWNsZSgpIHtcbiAgc3RhdGUuc2x1ZyA9IG0ucm91dGUucGFyYW0oJ3NsdWcnKTtcbiAgZG9tYWluLmFjdGlvbnMuc2V0U2VsZWN0ZWRBcnRpY2xlKHN0YXRlLnNsdWcpO1xuICBkb21haW4uYWN0aW9ucy5zZXRTZWxlY3RlZEFydGljbGVDb21tZW50cyhzdGF0ZS5zbHVnKTtcbiAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSAwO1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCgpIHtcbiAgZ2V0QXJ0aWNsZSgpO1xufVxuXG5cbmZ1bmN0aW9uIG9uYmVmb3JldXBkYXRlKCkge1xuICBpZiAoc3RhdGUuc2x1ZyAhPT0gbS5yb3V0ZS5wYXJhbSgnc2x1ZycpKSB7XG4gICAgZ2V0QXJ0aWNsZSgpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cblxuZnVuY3Rpb24gb251cGRhdGUoKSB7XG4gIGlmIChkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlLmRhdGEpIHtcbiAgICB1dGlscy51cGRhdGVEb2N1bWVudFRpdGxlKGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGUuZGF0YS50aXRsZSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuICByZXR1cm4gbSgnZGl2LmFydGljbGUtcGFnZScsXG4gICAgW1xuICAgICAgbShCYW5uZXIsXG4gICAgICAgIG0oQXJ0aWNsZUJhbm5lciwgeyBhcnRpY2xlOiBkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlIH0pXG4gICAgICApLFxuICAgICAgbSgnZGl2LmNvbnRhaW5lcicsIFtcbiAgICAgICAgbSgnZGl2LnJvdycsIFtcbiAgICAgICAgICBtKEFydGljbGVDb250ZW50LCB7IGFydGljbGU6IGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGUgfSksXG4gICAgICAgIF0pLFxuICAgICAgICBtKCdocicpLFxuICAgICAgICBtKCdkaXYuYXJ0aWNsZS1hY3Rpb25zJywgW1xuICAgICAgICAgIG0oQXJ0aWNsZU1ldGFBbmRBY3Rpb25zLCB7IGFydGljbGU6IGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGUgfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJ2Rpdi5yb3cnLFxuICAgICAgICAgIG0oJ2Rpdi5jb2wteHMtMTIuY29sLW1kLTgub2Zmc2V0LW1kLTInLFxuICAgICAgICAgICAgbShDb21tZW50cywgeyBjb21tZW50czogZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZUNvbW1lbnRzLCBjdXJyZW50VXNlcjogZG9tYWluLnN0b3JlLnVzZXIgfSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIF0pXG4gICAgXVxuICApO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb25pbml0OiBvbmluaXQsXG4gIG9uYmVmb3JldXBkYXRlOiBvbmJlZm9yZXVwZGF0ZSxcbiAgb251cGRhdGU6IG9udXBkYXRlLFxuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIE5ld0FydGljbGVGb3JtID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL05ld0FydGljbGVGb3JtJyk7XG52YXIgTGlzdEVycm9ycyA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9MaXN0RXJyb3JzJyk7XG5cblxuZnVuY3Rpb24gb25pbml0KCkge1xuICB1dGlscy51cGRhdGVEb2N1bWVudFRpdGxlKCdFZGl0b3InKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuICByZXR1cm4gbSgnLmNvbnRhaW5lci5wYWdlJywgW1xuICAgIG0oJy5yb3cnLCBbXG4gICAgICBtKCcuY29sLW1kLTEwLm9mZnNldC1tZC0xLmNvbC14cy0xMicsIFtcbiAgICAgICAgbShMaXN0RXJyb3JzLCB7IGVycm9yczogZG9tYWluLnN0b3JlLmNyZWF0ZUFydGljbGVFcnJvcnMgfSksXG4gICAgICAgIG0oTmV3QXJ0aWNsZUZvcm0sIHsgaXNTdWJtaXRCdXN5OiBkb21haW4uc3RvcmUuaXNDcmVhdGVBcnRpY2xlQnVzeSwgZm5fc3VibWl0OiBkb21haW4uYWN0aW9ucy5jcmVhdGVBcnRpY2xlIH0pXG4gICAgICBdKVxuICAgIF0pXG4gIF0pO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb25pbml0OiBvbmluaXQsXG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgQmFubmVyID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0Jhbm5lcicpO1xudmFyIEFydGljbGVMaXN0ID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0FydGljbGVMaXN0Jyk7XG52YXIgRmVlZFRvZ2dsZSA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9GZWVkVG9nZ2xlJyk7XG52YXIgUG9wdWxhclRhZ0xpc3QgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvUG9wdWxhclRhZ0xpc3QnKTtcblxuXG5mdW5jdGlvbiBvblRhZ0l0ZW1DbGljayh0YWcpIHtcbiAgZG9tYWluLmFjdGlvbnMuZ2V0QXJ0aWNsZXNCeVRhZyh0YWcpO1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCgpIHtcbiAgdXRpbHMudXBkYXRlRG9jdW1lbnRUaXRsZSgnSG9tZScpO1xuICBkb21haW4uYWN0aW9ucy5nZXRUYWdzKCk7XG59XG5cblxuZnVuY3Rpb24gdmlldygpIHtcbiAgdmFyIGJhbm5lciA9IG0oQmFubmVyKTtcblxuICBpZiAoZG9tYWluLnN0b3JlLnVzZXIpIHtcbiAgICBiYW5uZXIgPSBudWxsO1xuICB9XG5cbiAgcmV0dXJuIG0oJ2Rpdi5ob21lLXBhZ2UnLFxuICAgIFtcbiAgICAgIGJhbm5lcixcbiAgICAgIG0oJy5jb250YWluZXIucGFnZScsIFtcbiAgICAgICAgbSgnLnJvdycsIFtcbiAgICAgICAgICBtKCcuY29sLW1kLTknLCBbXG4gICAgICAgICAgICBtKEZlZWRUb2dnbGUsIHtcbiAgICAgICAgICAgICAgY3VycmVudFR5cGU6IGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGVzLnR5cGUsIHVzZXJuYW1lOiBkb21haW4uc3RvcmUudXNlciA/IGRvbWFpbi5zdG9yZS51c2VyLnVzZXJuYW1lIDogJycsIGxpbmtUeXBlczogW1xuICAgICAgICAgICAgICAgIGRvbWFpbi5zdG9yZS5hcnRpY2xlTGlzdFR5cGVzLlVTRVJfRkFWT1JJVEVELFxuICAgICAgICAgICAgICAgIGRvbWFpbi5zdG9yZS5hcnRpY2xlTGlzdFR5cGVzLkdMT0JBTCxcbiAgICAgICAgICAgICAgICBkb21haW4uc3RvcmUuYXJ0aWNsZUxpc3RUeXBlcy5VU0VSX09XTkVEXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbShBcnRpY2xlTGlzdCwgeyBsaW1pdDogMTAgfSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuY29sLW1kLTMnLCBbXG4gICAgICAgICAgICBtKCcuc2lkZWJhcicsIG0oUG9wdWxhclRhZ0xpc3QsIHsgZm5fb25UYWdJdGVtQ2xpY2s6IG9uVGFnSXRlbUNsaWNrLCBpc0xvYWRpbmc6IGRvbWFpbi5zdG9yZS50YWdzLmlzTG9hZGluZywgbGlzdDogZG9tYWluLnN0b3JlLnRhZ3MubGlzdCB9KSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSlcbiAgICBdXG4gICk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvbmluaXQ6IG9uaW5pdCxcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBCYW5uZXIgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQmFubmVyJyk7XG5cblxudmFyIHN0YXRlID0ge1xuICB1c2VybmFtZTogJydcbn07XG5cblxuZnVuY3Rpb24gZ2V0VXNlclByb2ZpbGUoKSB7XG4gIHN0YXRlLnVzZXJuYW1lID0gbS5yb3V0ZS5wYXJhbSgndXNlcm5hbWUnKTtcbiAgZG9tYWluLmFjdGlvbnMuZ2V0VXNlclByb2ZpbGUoc3RhdGUudXNlcm5hbWUpO1xuICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9IDA7XG59XG5cblxuZnVuY3Rpb24gb25pbml0KCkge1xuICBnZXRVc2VyUHJvZmlsZSgpO1xufVxuXG5cbmZ1bmN0aW9uIG9uYmVmb3JldXBkYXRlKCkge1xuICBpZiAoc3RhdGUudXNlcm5hbWUgIT09IG0ucm91dGUucGFyYW0oJ3VzZXJuYW1lJykpIHtcbiAgICBnZXRVc2VyUHJvZmlsZSgpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cblxuZnVuY3Rpb24gb251cGRhdGUoKSB7XG4gIHV0aWxzLnVwZGF0ZURvY3VtZW50VGl0bGUoJ0FydGljbGVzIGZhdm91cml0ZWQgYnkgJyArIHN0YXRlLnVzZXJuYW1lKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuICByZXR1cm4gbSgnZGl2JyxcbiAgICBbXG4gICAgICBtKEJhbm5lciksXG4gICAgICBtKCdoMScsICdTY3JlZW5Vc2VyRmF2b3JpdGVzJylcbiAgICBdXG4gICk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvbmluaXQ6IG9uaW5pdCxcbiAgb25iZWZvcmV1cGRhdGU6IG9uYmVmb3JldXBkYXRlLFxuICBvbnVwZGF0ZTogb251cGRhdGUsXG4gIHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgTGluayA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9MaW5rJyk7XG52YXIgVXNlckxvZ2luRm9ybSA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9Vc2VyTG9naW5Gb3JtJyk7XG52YXIgTGlzdEVycm9ycyA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9MaXN0RXJyb3JzJyk7XG5cblxuZnVuY3Rpb24gcmVkaXJlY3RJZlVzZXJMb2dnZWRJbigpIHtcbiAgaWYgKGRvbWFpbi5zdG9yZS51c2VyKSB7XG4gICAgZG9tYWluLmFjdGlvbnMucmVkaXJlY3RBZnRlclVzZXJMb2dpblN1Y2Nlc3MoKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCgpIHtcbiAgdXRpbHMudXBkYXRlRG9jdW1lbnRUaXRsZSgnU2lnbiBpbicpO1xuXG4gIHJlZGlyZWN0SWZVc2VyTG9nZ2VkSW4oKTtcbn1cblxuXG5mdW5jdGlvbiBvbnVwZGF0ZSgpIHtcbiAgcmVkaXJlY3RJZlVzZXJMb2dnZWRJbigpO1xufVxuXG5cbmZ1bmN0aW9uIHZpZXcoKSB7XG4gIHJldHVybiBtKCdkaXYnLFxuICAgIFtcbiAgICAgIG0oJy5jb250YWluZXIucGFnZScsIFtcbiAgICAgICAgbSgnLnJvdycsIFtcbiAgICAgICAgICBtKCcuY29sLW1kLTYub2Zmc2V0LW1kLTMuY29sLXhzLTEyJywgW1xuICAgICAgICAgICAgbSgnaDEudGV4dC14cy1jZW50ZXInLCAnU2lnbiBpbicpLFxuICAgICAgICAgICAgbSgncC50ZXh0LXhzLWNlbnRlcicsXG4gICAgICAgICAgICAgIG0oTGluaywgeyB0bzogJy9yZWdpc3RlcicgfSwgJ05lZWQgYW4gYWNjb3VudD8nKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG0oTGlzdEVycm9ycywgeyBlcnJvcnM6IGRvbWFpbi5zdG9yZS51c2VyTG9naW5FcnJvcnMgfSksXG4gICAgICAgICAgICBtKFVzZXJMb2dpbkZvcm0sIHsgaXNVc2VyTG9naW5CdXN5OiBkb21haW4uc3RvcmUuaXNVc2VyTG9naW5CdXN5IH0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgXVxuICApO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb25pbml0OiBvbmluaXQsXG4gIG9udXBkYXRlOiBvbnVwZGF0ZSxcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBVc2VySW5mb0Jhbm5lciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9Vc2VySW5mb0Jhbm5lcicpO1xudmFyIEZlZWRUb2dnbGUgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvRmVlZFRvZ2dsZScpO1xudmFyIEFydGljbGVMaXN0ID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0FydGljbGVMaXN0Jyk7XG5cblxudmFyIHN0YXRlID0ge1xuICB1c2VybmFtZTogJydcbn07XG5cblxuZnVuY3Rpb24gZ2V0VXNlclByb2ZpbGUoKSB7XG4gIHN0YXRlLnVzZXJuYW1lID0gbS5yb3V0ZS5wYXJhbSgndXNlcm5hbWUnKTtcbiAgZG9tYWluLmFjdGlvbnMuZ2V0VXNlclByb2ZpbGUoc3RhdGUudXNlcm5hbWUpO1xuICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9IDA7XG59XG5cblxuZnVuY3Rpb24gb25pbml0KCkge1xuICBnZXRVc2VyUHJvZmlsZSgpO1xufVxuXG5cbmZ1bmN0aW9uIG9uYmVmb3JldXBkYXRlKCkge1xuICBpZiAoc3RhdGUudXNlcm5hbWUgIT09IG0ucm91dGUucGFyYW0oJ3VzZXJuYW1lJykpIHtcbiAgICBnZXRVc2VyUHJvZmlsZSgpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cblxuZnVuY3Rpb24gb251cGRhdGUoKSB7XG4gIHV0aWxzLnVwZGF0ZURvY3VtZW50VGl0bGUoJ0AnICsgc3RhdGUudXNlcm5hbWUpO1xufVxuXG5cbmZ1bmN0aW9uIHZpZXcoKSB7XG4gIHZhciB1c2VybmFtZSA9IG0ucm91dGUucGFyYW0oJ3VzZXJuYW1lJykgfHwgJyc7XG5cbiAgcmV0dXJuIG0oJy5wcm9maWxlLXBhZ2UnLFxuICAgIFtcbiAgICAgIG0oVXNlckluZm9CYW5uZXIsIHsgbG9nZ2VkSW5Vc2VyOiBkb21haW4uc3RvcmUudXNlciwgc2VsZWN0ZWRVc2VyOiBkb21haW4uc3RvcmUuc2VsZWN0ZWRVc2VyUHJvZmlsZS5kYXRhLCBpc0xvYWRpbmc6IGRvbWFpbi5zdG9yZS5zZWxlY3RlZFVzZXJQcm9maWxlLmlzTG9hZGluZyB9KSxcbiAgICAgIG0oJy5jb250YWluZXInLCBbXG4gICAgICAgIG0oJy5yb3cnLCBbXG4gICAgICAgICAgbSgnLmNvbC1tZC0xMicsIFtcbiAgICAgICAgICAgIG0oRmVlZFRvZ2dsZSwge1xuICAgICAgICAgICAgICBjdXJyZW50VHlwZTogZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZXMudHlwZSwgdXNlcm5hbWU6IHVzZXJuYW1lLCBsaW5rVHlwZXM6IFtcbiAgICAgICAgICAgICAgICBkb21haW4uc3RvcmUuYXJ0aWNsZUxpc3RUeXBlcy5VU0VSX09XTkVELFxuICAgICAgICAgICAgICAgIGRvbWFpbi5zdG9yZS5hcnRpY2xlTGlzdFR5cGVzLlVTRVJfRkFWT1JJVEVEXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbShBcnRpY2xlTGlzdCwgeyBsaW1pdDogNSB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIF1cbiAgKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG9uaW5pdDogb25pbml0LFxuICBvbmJlZm9yZXVwZGF0ZTogb25iZWZvcmV1cGRhdGUsXG4gIG9udXBkYXRlOiBvbnVwZGF0ZSxcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBMaW5rID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0xpbmsnKTtcbnZhciBMaXN0RXJyb3JzID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0xpc3RFcnJvcnMnKTtcbnZhciBVc2VyUmVnaXN0cmF0aW9uRm9ybSA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9Vc2VyUmVnaXN0cmF0aW9uRm9ybScpO1xuXG5cbmZ1bmN0aW9uIG9uaW5pdCgpIHtcbiAgdXRpbHMudXBkYXRlRG9jdW1lbnRUaXRsZSgnU2lnbiB1cCcpO1xufVxuXG5cbmZ1bmN0aW9uIG9udXBkYXRlKCkge1xuICBpZiAoZG9tYWluLnN0b3JlLnVzZXIpIHtcbiAgICBkb21haW4uYWN0aW9ucy5yZWRpcmVjdEFmdGVyVXNlclJlZ2lzdHJhdGlvblN1Y2Nlc3MoKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHZpZXcoKSB7XG4gIHJldHVybiBtKCdkaXYnLFxuICAgIFtcbiAgICAgIG0oJy5jb250YWluZXIucGFnZScsIFtcbiAgICAgICAgbSgnLnJvdycsIFtcbiAgICAgICAgICBtKCcuY29sLW1kLTYub2Zmc2V0LW1kLTMuY29sLXhzLTEyJywgW1xuICAgICAgICAgICAgbSgnaDEudGV4dC14cy1jZW50ZXInLCAnU2lnbiB1cCcpLFxuICAgICAgICAgICAgbSgncC50ZXh0LXhzLWNlbnRlcicsXG4gICAgICAgICAgICAgIG0oTGluaywgeyB0bzogJy9sb2dpbicgfSwgJ0hhdmUgYW4gYWNjb3VudD8nKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG0oTGlzdEVycm9ycywgeyBlcnJvcnM6IGRvbWFpbi5zdG9yZS51c2VyUmVnaXN0cmF0aW9uRXJyb3JzIH0pLFxuICAgICAgICAgICAgbShVc2VyUmVnaXN0cmF0aW9uRm9ybSwgeyBpc1VzZXJSZWdpc3RyYXRpb25CdXN5OiBkb21haW4uc3RvcmUuaXNVc2VyUmVnaXN0cmF0aW9uQnVzeSwgZm5fcmVnaXN0ZXJVc2VyOiBkb21haW4uYWN0aW9ucy5yZWdpc3Rlck5ld1VzZXIgfSlcbiAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgICAgXSlcbiAgICBdXG4gICk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvbmluaXQ6IG9uaW5pdCxcbiAgb251cGRhdGU6IG9udXBkYXRlLFxuICB2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIExpc3RFcnJvcnMgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvTGlzdEVycm9ycycpO1xudmFyIFVzZXJTZXR0aW5nc0Zvcm0gPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvVXNlclNldHRpbmdzRm9ybScpO1xuXG5cbmZ1bmN0aW9uIG9uaW5pdCgpIHtcbiAgdXRpbHMudXBkYXRlRG9jdW1lbnRUaXRsZSgnU2V0dGluZ3MnKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuICByZXR1cm4gbSgnLmNvbnRhaW5lci5wYWdlJywgW1xuICAgIG0oJy5yb3cnLCBbXG4gICAgICBtKCcuY29sLW1kLTYub2Zmc2V0LW1kLTMuY29sLXhzLTEyJywgW1xuICAgICAgICBtKCdoMS50ZXh0LXhzLWNlbnRlcicsICdZb3VyIFNldHRpbmdzJyksXG4gICAgICAgIG0oTGlzdEVycm9ycywgeyBlcnJvcnM6IGRvbWFpbi5zdG9yZS51c2VyVXBkYXRlU2V0dGluZ3NFcnJvcnMgfSksXG4gICAgICAgIG0oVXNlclNldHRpbmdzRm9ybSwgeyBjdXJyZW50VXNlcjogZG9tYWluLnN0b3JlLnVzZXIsIGlzVXNlclNldHRpbmdzVXBkYXRlQnVzeTogZG9tYWluLnN0b3JlLmlzVXNlclNldHRpbmdzVXBkYXRlQnVzeSwgZm5fdXBkYXRlVXNlclNldHRpbmdzOiBkb21haW4uYWN0aW9ucy51cGRhdGVVc2VyU2V0dGluZ3MsIGZuX2xvZ1VzZXJPdXQ6IGRvbWFpbi5hY3Rpb25zLmxvZ1VzZXJPdXQgfSlcbiAgICAgIF0pXG4gICAgXSlcbiAgXSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvbmluaXQ6IG9uaW5pdCxcbiAgdmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi9kb21haW4nKTtcblxuXG52YXIgeHNzRmlsdGVycyA9IHJlcXVpcmUoJ3hzcy1maWx0ZXJzJyk7XG52YXIgZGF0ZUZvcm1hdFR5cGVzID0ge1xuICBERUZBVUxUOiAnbW1tbSBkLCB5eXl5JyxcbiAgREVGQVVMVF9XSVRIX1RJTUU6ICdtbW1tIGQsIHl5eXkgQCBISDpNTTpzcydcbn07XG5cblxuZnVuY3Rpb24gdXBkYXRlRG9jdW1lbnRUaXRsZSh0ZXh0KSB7XG4gIGRvY3VtZW50LnRpdGxlID0gdGV4dCArICcg4oCUICcgKyBkb21haW4uc3RvcmUuYXBwVGl0bGU7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZShkYXRlU3RyaW5nLCBmb3JtYXQpIHtcbiAgdmFyIGRhdGVGb3JtYXQgPSByZXF1aXJlKCdkYXRlZm9ybWF0Jyk7XG5cbiAgaWYgKCFmb3JtYXQpIHtcbiAgICBmb3JtYXQgPSBkYXRlRm9ybWF0VHlwZXMuREVGQVVMVDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShkYXRlU3RyaW5nKTtcbiAgICByZXR1cm4gZGF0ZUZvcm1hdChkYXRlLCBmb3JtYXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRhdGVTdHJpbmc7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBjb252ZXJ0TWFya2Rvd25Ub0hUTUwoY29udGVudCkge1xuICB2YXIgbWFya2VkID0gcmVxdWlyZSgnbWFya2VkJyk7XG5cbiAgcmV0dXJuIG1hcmtlZChjb250ZW50KTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnRpY2xlQ29tbWVudEJvZHlUZXh0KGNvbnRlbnQpIHtcbiAgcmV0dXJuIGNvbnZlcnRNYXJrZG93blRvSFRNTCh4c3NGaWx0ZXJzLmluU2luZ2xlUXVvdGVkQXR0cihjb250ZW50KSk7XG59XG5cblxuZnVuY3Rpb24gZ2V0TGlua1RvVXNlclByb2ZpbGUodXNlcm5hbWUpIHtcbiAgcmV0dXJuICcvQCcgKyB1c2VybmFtZTtcbn1cblxuXG5mdW5jdGlvbiBnZXRVc2VySW1hZ2VPckRlZmF1bHQodXNlcikge1xuICBpZiAodXNlciAmJiAodXNlci5pbWFnZSkpIHtcbiAgICByZXR1cm4gdXNlci5pbWFnZTtcbiAgfVxuXG4gIHJldHVybiAnaHR0cHM6Ly9zdGF0aWMucHJvZHVjdGlvbnJlYWR5LmlvL2ltYWdlcy9zbWlsZXktY3lydXMuanBnJztcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdXBkYXRlRG9jdW1lbnRUaXRsZTogdXBkYXRlRG9jdW1lbnRUaXRsZSxcbiAgZGF0ZUZvcm1hdHM6IGRhdGVGb3JtYXRUeXBlcyxcbiAgZm9ybWF0RGF0ZTogZm9ybWF0RGF0ZSxcbiAgZm9ybWF0QXJ0aWNsZUNvbW1lbnRCb2R5VGV4dDogZm9ybWF0QXJ0aWNsZUNvbW1lbnRCb2R5VGV4dCxcbiAgY29udmVydE1hcmtkb3duVG9IVE1MOiBjb252ZXJ0TWFya2Rvd25Ub0hUTUwsXG4gIGdldExpbmtUb1VzZXJQcm9maWxlOiBnZXRMaW5rVG9Vc2VyUHJvZmlsZSxcbiAgZ2V0VXNlckltYWdlT3JEZWZhdWx0OiBnZXRVc2VySW1hZ2VPckRlZmF1bHRcbn07XG4iXX0=
