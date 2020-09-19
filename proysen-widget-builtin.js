!function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = "function" == typeof require && require;
                if (!u && a)
                    return a(o, !0);
                if (i)
                    return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND",
                f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    for (var i = "function" == typeof require && require, o = 0; o < r.length; o++)
        s(r[o]);
    return s
}({
    1: [function(require, module, exports) {
        "use strict";
        function elt(tag, attrs) {
            var result = document.createElement(tag);
            if (attrs)
                for (var name in attrs)
                    "style" == name ? result.style.cssText = attrs[name] : null != attrs[name] && result.setAttribute(name, attrs[name]);
            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _len > _key; _key++)
                args[_key - 2] = arguments[_key];
            for (var i = 0; i < args.length; i++)
                add(args[i], result);
            return result
        }
        function add(value, target) {
            if ("string" == typeof value && (value = document.createTextNode(value)),
            Array.isArray(value))
                for (var i = 0; i < value.length; i++)
                    add(value[i], target);
            else
                target.appendChild(value)
        }
        function requestAnimationFrame(f) {
            return reqFrame ? reqFrame(f) : setTimeout(f, 10)
        }
        function cancelAnimationFrame(handle) {
            return reqFrame ? cancelFrame(handle) : void clearTimeout(handle)
        }
        function contains(parent, child) {
            return 1 != child.nodeType && (child = child.parentNode),
            child && parent.contains(child)
        }
        function insertCSS(css) {
            cssNode ? cssNode.textContent += css : accumulatedCSS += css
        }
        function ensureCSSAdded() {
            cssNode || (cssNode = document.createElement("style"),
            cssNode.textContent = "/* ProseMirror CSS */\n" + accumulatedCSS,
            document.head.insertBefore(cssNode, document.head.firstChild))
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.elt = elt,
        exports.requestAnimationFrame = requestAnimationFrame,
        exports.cancelAnimationFrame = cancelAnimationFrame,
        exports.contains = contains,
        exports.insertCSS = insertCSS,
        exports.ensureCSSAdded = ensureCSSAdded;
        var reqFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
          , cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame
          , ie_upto10 = /MSIE \d/.test(navigator.userAgent)
          , ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent)
          , accumulatedCSS = (exports.browser = {
            mac: /Mac/.test(navigator.platform),
            ie_upto10: ie_upto10,
            ie_11up: ie_11up,
            ie: ie_upto10 || ie_11up,
            gecko: /gecko\/\d/i.test(navigator.userAgent),
            ios: /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent)
        },
        "")
          , cssNode = null
    }
    , {}],
    2: [function(require, module, exports) {
        "use strict";
        function _toConsumableArray(arr) {
            if (Array.isArray(arr)) {
                for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++)
                    arr2[i] = arr[i];
                return arr2
            }
            return Array.from(arr)
        }
        function deleteBarrier(pm, cut) {
            var $cut = pm.doc.resolve(cut)
              , before = $cut.nodeBefore
              , after = $cut.nodeAfter;
            if (before.type.canContainContent(after.type)) {
                var tr = pm.tr.join(cut);
                if (tr.steps.length && 0 == before.content.size && !before.sameMarkup(after) && tr.setNodeType(cut - before.nodeSize, after.type, after.attrs),
                tr.apply(pm.apply.scroll) !== !1)
                    return
            }
            var conn = void 0;
            if (after.isTextblock && (conn = before.type.findConnection(after.type))) {
                var tr = pm.tr
                  , end = cut + after.nodeSize;
                if (tr.step("ancestor", cut, end, {
                    types: [before.type].concat(_toConsumableArray(conn)),
                    attrs: [before.attrs].concat(_toConsumableArray(conn.map(function() {
                        return null
                    })))
                }),
                tr.join(end + 2 * conn.length + 2, 1, !0),
                tr.join(cut),
                tr.apply(pm.apply.scroll) !== !1)
                    return
            }
            var selAfter = (0,
            _selection.findSelectionFrom)(pm.doc, cut, 1);
            return pm.tr.lift(selAfter.from, selAfter.to, !0).apply(pm.apply.scroll)
        }
        function moveBackward(doc, pos, by) {
            if ("char" != by && "word" != by)
                throw new RangeError("Unknown motion unit: " + by);
            for (var $pos = doc.resolve(pos), parent = $pos.parent, offset = $pos.parentOffset, cat = null, counted = 0; ; ) {
                if (0 == offset)
                    return pos;
                var _parent$childBefore = parent.childBefore(offset)
                  , start = _parent$childBefore.offset
                  , node = _parent$childBefore.node;
                if (!node)
                    return pos;
                if (!node.isText)
                    return cat ? pos : pos - 1;
                if ("char" == by)
                    for (var i = offset - start; i > 0; i--) {
                        if (!(0,
                        _char.isExtendingChar)(node.text.charAt(i - 1)))
                            return pos - 1;
                        offset--,
                        pos--
                    }
                else if ("word" == by)
                    for (var i = offset - start; i > 0; i--) {
                        var nextCharCat = (0,
                        _char.charCategory)(node.text.charAt(i - 1));
                        if (null == cat || 1 == counted && "space" == cat)
                            cat = nextCharCat;
                        else if (cat != nextCharCat)
                            return pos;
                        offset--,
                        pos--,
                        counted++
                    }
            }
        }
        function moveForward(doc, pos, by) {
            if ("char" != by && "word" != by)
                throw new RangeError("Unknown motion unit: " + by);
            for (var $pos = doc.resolve(pos), parent = $pos.parent, offset = $pos.parentOffset, cat = null, counted = 0; ; ) {
                if (offset == parent.content.size)
                    return pos;
                var _parent$childAfter = parent.childAfter(offset)
                  , start = _parent$childAfter.offset
                  , node = _parent$childAfter.node;
                if (!node)
                    return pos;
                if (!node.isText)
                    return cat ? pos : pos + 1;
                if ("char" == by)
                    for (var i = offset - start; i < node.text.length; i++) {
                        if (!(0,
                        _char.isExtendingChar)(node.text.charAt(i + 1)))
                            return pos + 1;
                        offset++,
                        pos++
                    }
                else if ("word" == by)
                    for (var i = offset - start; i < node.text.length; i++) {
                        var nextCharCat = (0,
                        _char.charCategory)(node.text.charAt(i));
                        if (null == cat || 1 == counted && "space" == cat)
                            cat = nextCharCat;
                        else if (cat != nextCharCat)
                            return pos;
                        offset++,
                        pos++,
                        counted++
                    }
            }
        }
        function joinPointAbove(pm) {
            var _pm$selection7 = pm.selection
              , node = _pm$selection7.node
              , from = _pm$selection7.from;
            return node ? (0,
            _transform.joinable)(pm.doc, from) ? from : null : (0,
            _transform.joinPoint)(pm.doc, from, -1)
        }
        function joinPointBelow(pm) {
            var _pm$selection8 = pm.selection
              , node = _pm$selection8.node
              , to = _pm$selection8.to;
            return node ? (0,
            _transform.joinable)(pm.doc, to) ? to : null : (0,
            _transform.joinPoint)(pm.doc, to, 1)
        }
        function nodeAboveSelection(pm) {
            var sel = pm.selection;
            if (sel.node) {
                var $from = pm.doc.resolve(sel.from);
                return !!$from.depth && $from.before($from.depth)
            }
            var $head = pm.doc.resolve(sel.head)
              , same = $head.sameDepth(pm.doc.resolve(sel.anchor));
            return 0 == same ? !1 : $head.before(same)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.baseCommands = void 0;
        var _transform = require("../transform")
          , _char = require("./char")
          , _selection = require("./selection")
          , baseCommands = exports.baseCommands = Object.create(null);
        baseCommands.deleteSelection = {
            label: "Delete the selection",
            run: function(pm) {
                return pm.tr.replaceSelection().apply(pm.apply.scroll)
            },
            keys: {
                all: ["Backspace(10)", "Delete(10)", "Mod-Backspace(10)", "Mod-Delete(10)"],
                mac: ["Ctrl-H(10)", "Alt-Backspace(10)", "Ctrl-D(10)", "Ctrl-Alt-Backspace(10)", "Alt-Delete(10)", "Alt-D(10)"]
            }
        },
        baseCommands.joinBackward = {
            label: "Join with the block above",
            run: function(pm) {
                var _pm$selection = pm.selection
                  , head = _pm$selection.head
                  , empty = _pm$selection.empty;
                if (!empty)
                    return !1;
                var $head = pm.doc.resolve(head);
                if ($head.parentOffset > 0)
                    return !1;
                for (var before = void 0, cut = void 0, i = $head.depth - 1; !before && i >= 0; i--)
                    $head.index(i) > 0 && (cut = $head.before(i + 1),
                    before = $head.node(i).child($head.index(i) - 1));
                if (!before)
                    return pm.tr.lift(head, head, !0).apply(pm.apply.scroll);
                if (null == before.type.contains && before.type.selectable && 0 == $head.parent.content.size) {
                    var tr = pm.tr["delete"](cut, cut + $head.parent.nodeSize).apply(pm.apply.scroll);
                    return pm.setNodeSelection(cut - before.nodeSize),
                    tr
                }
                return null == before.type.contains ? pm.tr["delete"](cut - before.nodeSize, cut).apply(pm.apply.scroll) : deleteBarrier(pm, cut)
            },
            keys: ["Backspace(30)", "Mod-Backspace(30)"]
        },
        baseCommands.deleteCharBefore = {
            label: "Delete a character before the cursor",
            run: function(pm) {
                var _pm$selection2 = pm.selection
                  , head = _pm$selection2.head
                  , empty = _pm$selection2.empty;
                if (!empty || 0 == pm.doc.resolve(head).parentOffset)
                    return !1;
                var dest = moveBackward(pm.doc, head, "char");
                return pm.tr["delete"](dest, head).apply(pm.apply.scroll)
            },
            keys: {
                all: ["Backspace(60)"],
                mac: ["Ctrl-H(40)"]
            }
        },
        baseCommands.deleteWordBefore = {
            label: "Delete the word before the cursor",
            run: function(pm) {
                var _pm$selection3 = pm.selection
                  , head = _pm$selection3.head
                  , empty = _pm$selection3.empty;
                if (!empty || 0 == pm.doc.resolve(head).parentOffset)
                    return !1;
                var dest = moveBackward(pm.doc, head, "word");
                return pm.tr["delete"](dest, head).apply(pm.apply.scroll)
            },
            keys: {
                all: ["Mod-Backspace(40)"],
                mac: ["Alt-Backspace(40)"]
            }
        },
        baseCommands.joinForward = {
            label: "Join with the block below",
            run: function(pm) {
                var _pm$selection4 = pm.selection
                  , head = _pm$selection4.head
                  , empty = _pm$selection4.empty
                  , $head = void 0;
                if (!empty || ($head = pm.doc.resolve(head)).parentOffset < $head.parent.content.size)
                    return !1;
                for (var after = void 0, cut = void 0, i = $head.depth - 1; !after && i >= 0; i--) {
                    var parent = $head.node(i);
                    $head.index(i) + 1 < parent.childCount && (after = parent.child($head.index(i) + 1),
                    cut = $head.after(i + 1))
                }
                return after ? null == after.type.contains ? pm.tr["delete"](cut, cut + after.nodeSize).apply(pm.apply.scroll) : deleteBarrier(pm, cut) : !1
            },
            keys: ["Delete(30)", "Mod-Delete(30)"]
        },
        baseCommands.deleteCharAfter = {
            label: "Delete a character after the cursor",
            run: function(pm) {
                var _pm$selection5 = pm.selection
                  , head = _pm$selection5.head
                  , empty = _pm$selection5.empty
                  , $head = void 0;
                if (!empty || ($head = pm.doc.resolve(head)).parentOffset == $head.parent.content.size)
                    return !1;
                var dest = moveForward(pm.doc, head, "char");
                return pm.tr["delete"](head, dest).apply(pm.apply.scroll)
            },
            keys: {
                all: ["Delete(60)"],
                mac: ["Ctrl-D(60)"]
            }
        },
        baseCommands.deleteWordAfter = {
            label: "Delete a word after the cursor",
            run: function(pm) {
                var _pm$selection6 = pm.selection
                  , head = _pm$selection6.head
                  , empty = _pm$selection6.empty
                  , $head = void 0;
                if (!empty || ($head = pm.doc.resolve(head)).parentOffset == $head.parent.content.size)
                    return !1;
                var dest = moveForward(pm.doc, head, "word");
                return pm.tr["delete"](head, dest).apply(pm.apply.scroll)
            },
            keys: {
                all: ["Mod-Delete(40)"],
                mac: ["Ctrl-Alt-Backspace(40)", "Alt-Delete(40)", "Alt-D(40)"]
            }
        },
        baseCommands.joinUp = {
            label: "Join with above block",
            run: function(pm) {
                var point = joinPointAbove(pm)
                  , selectNode = void 0;
                return point ? (pm.selection.node && (selectNode = point - pm.doc.resolve(point).nodeBefore.nodeSize),
                pm.tr.join(point).apply(),
                void (null != selectNode && pm.setNodeSelection(selectNode))) : !1
            },
            select: function(pm) {
                return joinPointAbove(pm)
            },
            menu: {
                group: "block",
                rank: 80,
                display: {
                    type: "icon",
                    width: 800,
                    height: 900,
                    path: "M0 75h800v125h-800z M0 825h800v-125h-800z M250 400h100v-100h100v100h100v100h-100v100h-100v-100h-100z"
                }
            },
            keys: ["Alt-Up"]
        },
        baseCommands.joinDown = {
            label: "Join with below block",
            run: function(pm) {
                var node = pm.selection.node
                  , nodeAt = pm.selection.from
                  , point = joinPointBelow(pm);
                return point ? (pm.tr.join(point).apply(),
                void (node && pm.setNodeSelection(nodeAt))) : !1
            },
            select: function(pm) {
                return joinPointBelow(pm)
            },
            keys: ["Alt-Down"]
        },
        baseCommands.lift = {
            label: "Lift out of enclosing block",
            run: function(pm) {
                var _pm$selection9 = pm.selection
                  , from = _pm$selection9.from
                  , to = _pm$selection9.to;
                return pm.tr.lift(from, to, !0).apply(pm.apply.scroll)
            },
            select: function(pm) {
                var _pm$selection10 = pm.selection
                  , from = _pm$selection10.from
                  , to = _pm$selection10.to;
                return (0,
                _transform.canLift)(pm.doc, from, to)
            },
            menu: {
                group: "block",
                rank: 75,
                display: {
                    type: "icon",
                    width: 1024,
                    height: 1024,
                    path: "M219 310v329q0 7-5 12t-12 5q-8 0-13-5l-164-164q-5-5-5-13t5-13l164-164q5-5 13-5 7 0 12 5t5 12zM1024 749v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12zM1024 530v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 310v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 91v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12z"
                }
            },
            keys: ["Mod-["]
        },
        baseCommands.newlineInCode = {
            label: "Insert newline",
            run: function(pm) {
                var _pm$selection11 = pm.selection
                  , from = _pm$selection11.from
                  , to = _pm$selection11.to
                  , node = _pm$selection11.node;
                if (node)
                    return !1;
                var $from = pm.doc.resolve(from);
                return !$from.parent.type.isCode || to >= $from.end($from.depth) ? !1 : pm.tr.typeText("\n").apply(pm.apply.scroll)
            },
            keys: ["Enter(10)"]
        },
        baseCommands.createParagraphNear = {
            label: "Create a paragraph near the selected block",
            run: function(pm) {
                var _pm$selection12 = pm.selection
                  , from = _pm$selection12.from
                  , to = _pm$selection12.to
                  , node = _pm$selection12.node;
                if (!node || !node.isBlock)
                    return !1;
                var side = pm.doc.resolve(from).parentOffset ? to : from;
                pm.tr.insert(side, pm.schema.defaultTextblockType().create()).apply(pm.apply.scroll),
                pm.setTextSelection(side + 1)
            },
            keys: ["Enter(20)"]
        },
        baseCommands.liftEmptyBlock = {
            label: "Move current block up",
            run: function(pm) {
                var _pm$selection13 = pm.selection
                  , head = _pm$selection13.head
                  , empty = _pm$selection13.empty
                  , $head = void 0;
                return !empty || ($head = pm.doc.resolve(head)).parentOffset > 0 || $head.parent.content.size ? !1 : $head.depth > 1 && $head.index($head.depth - 1) > 0 && $head.index($head.depth - 1) < $head.node($head.depth - 1).childCount - 1 && pm.tr.split($head.before($head.depth)).apply() !== !1 ? void 0 : pm.tr.lift(head, head, !0).apply(pm.apply.scroll)
            },
            keys: ["Enter(30)"]
        },
        baseCommands.splitBlock = {
            label: "Split the current block",
            run: function(pm) {
                var _pm$selection14 = pm.selection
                  , from = _pm$selection14.from
                  , to = _pm$selection14.to
                  , node = _pm$selection14.node
                  , $from = pm.doc.resolve(from);
                if (node && node.isBlock)
                    return $from.parentOffset ? pm.tr.split(from).apply(pm.apply.scroll) : !1;
                var $to = pm.doc.resolve(to)
                  , atEnd = $to.parentOffset == $to.parent.content.size
                  , deflt = pm.schema.defaultTextblockType()
                  , type = atEnd ? deflt : null
                  , tr = pm.tr["delete"](from, to).split(from, 1, type);
                return atEnd || $from.parentOffset || $from.parent.type == deflt || tr.setNodeType($from.before($from.depth), deflt),
                tr.apply(pm.apply.scroll)
            },
            keys: ["Enter(60)"]
        },
        baseCommands.selectParentNode = {
            label: "Select parent node",
            run: function(pm) {
                var node = nodeAboveSelection(pm);
                return node === !1 ? !1 : void pm.setNodeSelection(node)
            },
            select: function(pm) {
                return nodeAboveSelection(pm)
            },
            menu: {
                group: "block",
                rank: 90,
                display: {
                    type: "icon",
                    text: "⬚",
                    style: "font-weight: bold"
                }
            },
            keys: ["Esc"]
        },
        baseCommands.undo = {
            label: "Undo last change",
            run: function(pm) {
                return pm.scrollIntoView(),
                pm.history.undo()
            },
            select: function(pm) {
                return pm.history.undoDepth > 0
            },
            menu: {
                group: "history",
                rank: 10,
                display: {
                    type: "icon",
                    width: 1024,
                    height: 1024,
                    path: "M761 1024c113-206 132-520-313-509v253l-384-384 384-384v248c534-13 594 472 313 775z"
                }
            },
            keys: ["Mod-Z"]
        },
        baseCommands.redo = {
            label: "Redo last undone change",
            run: function(pm) {
                return pm.scrollIntoView(),
                pm.history.redo()
            },
            select: function(pm) {
                return pm.history.redoDepth > 0
            },
            menu: {
                group: "history",
                rank: 20,
                display: {
                    type: "icon",
                    width: 1024,
                    height: 1024,
                    path: "M576 248v-248l384 384-384 384v-253c-446-10-427 303-313 509-280-303-221-789 313-775z"
                }
            },
            keys: ["Mod-Y", "Shift-Mod-Z"]
        }
    }
    , {
        "../transform": 41,
        "./char": 4,
        "./selection": 17
    }],
    3: [function(require, module, exports) {
        "use strict";
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            }
        }
        function nothing() {}
        function moveSelectionBlock(pm, dir) {
            var _pm$selection = pm.selection
              , from = _pm$selection.from
              , to = _pm$selection.to
              , node = _pm$selection.node
              , side = pm.doc.resolve(dir > 0 ? to : from);
            return (0,
            _selection.findSelectionFrom)(pm.doc, node && node.isBlock ? side.pos : dir > 0 ? side.after(side.depth) : side.before(side.depth), dir)
        }
        function selectNodeHorizontally(pm, dir) {
            var _pm$selection2 = pm.selection
              , empty = _pm$selection2.empty
              , node = _pm$selection2.node
              , from = _pm$selection2.from
              , to = _pm$selection2.to;
            if (!empty && !node)
                return !1;
            if (node && node.isInline)
                return pm.setTextSelection(dir > 0 ? to : from),
                !0;
            if (!node) {
                var $from = pm.doc.resolve(from)
                  , _ref = dir > 0 ? $from.parent.childAfter($from.parentOffset) : $from.parent.childBefore($from.parentOffset)
                  , nextNode = _ref.node
                  , offset = _ref.offset;
                if (nextNode)
                    return nextNode.type.selectable && offset == $from.parentOffset - (dir > 0 ? 0 : nextNode.nodeSize) ? (pm.setNodeSelection(0 > dir ? from - nextNode.nodeSize : from),
                    !0) : !1
            }
            var next = moveSelectionBlock(pm, dir);
            return next && (next instanceof _selection.NodeSelection || node) ? (pm.setSelection(next),
            !0) : !1
        }
        function horiz(dir) {
            return function(pm) {
                var done = selectNodeHorizontally(pm, dir);
                return done && pm.scrollIntoView(),
                done
            }
        }
        function selectNodeVertically(pm, dir) {
            var _pm$selection3 = pm.selection
              , empty = _pm$selection3.empty
              , node = _pm$selection3.node
              , from = _pm$selection3.from
              , to = _pm$selection3.to;
            if (!empty && !node)
                return !1;
            var leavingTextblock = !0;
            if ((!node || node.isInline) && (pm.flush(),
            leavingTextblock = (0,
            _selection.verticalMotionLeavesTextblock)(pm, dir > 0 ? to : from, dir)),
            leavingTextblock) {
                var next = moveSelectionBlock(pm, dir);
                if (next && next instanceof _selection.NodeSelection)
                    return pm.setSelection(next),
                    !0
            }
            if (!node || node.isInline)
                return !1;
            var beyond = (0,
            _selection.findSelectionFrom)(pm.doc, 0 > dir ? from : to, dir);
            return beyond && pm.setSelection(beyond),
            !0
        }
        function vert(dir) {
            return function(pm) {
                var done = selectNodeVertically(pm, dir);
                return done !== !1 && pm.scrollIntoView(),
                done
            }
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.captureKeys = void 0;
        var _browserkeymap = require("browserkeymap")
          , _browserkeymap2 = _interopRequireDefault(_browserkeymap)
          , _selection = require("./selection")
          , _dom = require("../dom")
          , keys = {
            Esc: nothing,
            Enter: nothing,
            "Ctrl-Enter": nothing,
            "Mod-Enter": nothing,
            "Shift-Enter": nothing,
            Backspace: nothing,
            Delete: nothing,
            "Mod-B": nothing,
            "Mod-I": nothing,
            "Mod-Backspace": nothing,
            "Mod-Delete": nothing,
            "Shift-Backspace": nothing,
            "Shift-Delete": nothing,
            "Shift-Mod-Backspace": nothing,
            "Shift-Mod-Delete": nothing,
            "Mod-Z": nothing,
            "Mod-Y": nothing,
            "Shift-Mod-Z": nothing,
            "Ctrl-D": nothing,
            "Ctrl-H": nothing,
            "Ctrl-Alt-Backspace": nothing,
            "Alt-D": nothing,
            "Alt-Delete": nothing,
            "Alt-Backspace": nothing,
            Left: horiz(-1),
            "Mod-Left": horiz(-1),
            Right: horiz(1),
            "Mod-Right": horiz(1),
            Up: vert(-1),
            Down: vert(1)
        };
        _dom.browser.mac && (keys["Alt-Left"] = horiz(-1),
        keys["Alt-Right"] = horiz(1),
        keys["Ctrl-Backspace"] = keys["Ctrl-Delete"] = nothing);
        exports.captureKeys = new _browserkeymap2["default"](keys)
    }
    , {
        "../dom": 1,
        "./selection": 17,
        browserkeymap: 57
    }],
    4: [function(require, module, exports) {
        "use strict";
        function isWordChar(ch) {
            return /\w/.test(ch) || isExtendingChar(ch) || ch > "" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch))
        }
        function charCategory(ch) {
            return /\s/.test(ch) ? "space" : isWordChar(ch) ? "word" : "other"
        }
        function isExtendingChar(ch) {
            return ch.charCodeAt(0) >= 768 && extendingChar.test(ch)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.isWordChar = isWordChar,
        exports.charCategory = charCategory,
        exports.isExtendingChar = isExtendingChar;
        var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/
          , extendingChar = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/
    }
    , {}],
    5: [function(require, module, exports) {
        "use strict";
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            }
        }
        function _toConsumableArray(arr) {
            if (Array.isArray(arr)) {
                for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++)
                    arr2[i] = arr[i];
                return arr2
            }
            return Array.from(arr)
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function deriveCommandSpec(type, spec, name) {
            if (!spec.derive)
                return spec;
            var conf = "object" == _typeof(spec.derive) ? spec.derive : {}
              , dname = conf.name || name
              , derive = type.constructor.derivableCommands[dname];
            if (!derive)
                throw new RangeError("Don't know how to derive command " + dname);
            var derived = derive.call(type, conf);
            for (var prop in spec)
                "derive" != prop && (derived[prop] = spec[prop]);
            return derived
        }
        function deriveKeymap(pm) {
            function add(command, keys) {
                for (var i = 0; i < keys.length; i++) {
                    var _$exec = /^(.+?)(?:\((\d+)\))?$/.exec(keys[i])
                      , _$exec2 = _slicedToArray(_$exec, 3)
                      , name = (_$exec2[0],
                    _$exec2[1])
                      , _$exec2$ = _$exec2[2]
                      , rank = void 0 === _$exec2$ ? 50 : _$exec2$;
                    (0,
                    _sortedinsert2["default"])(bindings[name] || (bindings[name] = []), {
                        command: command,
                        rank: rank
                    }, function(a, b) {
                        return a.rank - b.rank
                    })
                }
            }
            var bindings = {}
              , platform = _dom.browser.mac ? "mac" : "pc";
            for (var name in pm.commands) {
                var cmd = pm.commands[name]
                  , keys = cmd.spec.keys;
                keys && (Array.isArray(keys) ? add(cmd, keys) : (keys.all && add(cmd, keys.all),
                keys[platform] && add(cmd, keys[platform])))
            }
            for (var key in bindings)
                bindings[key] = bindings[key].map(function(b) {
                    return b.command.name
                });
            return new _browserkeymap2["default"](bindings)
        }
        function updateCommands(pm, set) {
            pm.signal("commandsChanging"),
            pm.commands = set.derive(pm.schema),
            pm.input.baseKeymap = deriveKeymap(pm),
            pm.commandKeys = Object.create(null),
            pm.signal("commandsChanged")
        }
        function markActive(pm, type) {
            var sel = pm.selection;
            return sel.empty ? type.isInSet(pm.activeMarks()) : pm.doc.rangeHasMark(sel.from, sel.to, type)
        }
        function canAddInline(pm, type) {
            var _pm$selection = pm.selection
              , from = _pm$selection.from
              , to = _pm$selection.to
              , empty = _pm$selection.empty;
            if (empty)
                return !type.isInSet(pm.activeMarks()) && pm.doc.resolve(from).parent.type.canContainMark(type);
            var can = !1;
            return pm.doc.nodesBetween(from, to, function(node) {
                return can || node.isTextblock && !node.type.canContainMark(type) ? !1 : void (node.isInline && !type.isInSet(node.marks) && (can = !0))
            }),
            can
        }
        function markApplies(pm, type) {
            var _pm$selection2 = pm.selection
              , from = _pm$selection2.from
              , to = _pm$selection2.to
              , relevant = !1;
            return pm.doc.nodesBetween(from, to, function(node) {
                return node.isTextblock ? (node.type.canContainMark(type) && (relevant = !0),
                !1) : void 0
            }),
            relevant
        }
        function selectedMarkAttr(pm, type, attr) {
            var _pm$selection3 = pm.selection
              , from = _pm$selection3.from
              , to = _pm$selection3.to
              , empty = _pm$selection3.empty
              , start = void 0
              , end = void 0;
            if (empty)
                start = end = type.isInSet(pm.activeMarks());
            else {
                var startChunk = pm.doc.resolve(from).nodeAfter;
                start = startChunk ? type.isInSet(startChunk.marks) : null,
                end = type.isInSet(pm.doc.marksAt(to))
            }
            return start && end && start.attrs[attr] == end.attrs[attr] ? start.attrs[attr] : void 0
        }
        function selectedNodeAttr(pm, type, name) {
            var node = pm.selection.node;
            return node && node.type == type ? node.attrs[name] : void 0
        }
        function deriveParams(type, params) {
            return params && params.map(function(param) {
                var attr = type.attrs[param.attr]
                  , obj = {
                    type: "text",
                    "default": attr["default"],
                    prefill: type instanceof _model.NodeType ? function(pm) {
                        return selectedNodeAttr(pm, this, param.attr)
                    }
                    : function(pm) {
                        return selectedMarkAttr(pm, this, param.attr)
                    }
                };
                for (var prop in param)
                    obj[prop] = param[prop];
                return obj
            })
        }
        function fillAttrs(conf, givenParams) {
            var attrs = conf.attrs;
            return conf.params && !function() {
                var filled = Object.create(null);
                if (attrs)
                    for (var name in attrs)
                        filled[name] = attrs[name];
                conf.params.forEach(function(param, i) {
                    return filled[param.attr] = givenParams[i]
                }),
                attrs = filled
            }(),
            attrs
        }
        function isAtTopOfListItem(doc, from, to, listType) {
            var $from = doc.resolve(from);
            return $from.sameParent(doc.resolve(to)) && $from.depth >= 2 && 0 == $from.index($from.depth - 1) && listType.canContain($from.node($from.depth - 1))
        }
        function alreadyHasBlockType(doc, from, to, type, attrs) {
            var found = !1;
            return attrs || (attrs = {}),
            doc.nodesBetween(from, to || from, function(node) {
                return node.isTextblock ? (node.hasMarkup(type, attrs) && (found = !0),
                !1) : void 0
            }),
            found
        }
        function activeTextblockIs(pm, type, attrs) {
            var _pm$selection6 = pm.selection
              , from = _pm$selection6.from
              , to = _pm$selection6.to
              , node = _pm$selection6.node;
            if (!node || node.isInline) {
                var $from = pm.doc.resolve(from);
                if (!$from.sameParent(pm.doc.resolve(to)))
                    return !1;
                node = $from.parent
            } else if (!node.isTextblock)
                return !1;
            return node.hasMarkup(type, attrs)
        }
        var _slicedToArray = function() {
            function sliceIterator(arr, i) {
                var _arr = []
                  , _n = !0
                  , _d = !1
                  , _e = void 0;
                try {
                    for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value),
                    !i || _arr.length !== i); _n = !0)
                        ;
                } catch (err) {
                    _d = !0,
                    _e = err
                } finally {
                    try {
                        !_n && _i["return"] && _i["return"]()
                    } finally {
                        if (_d)
                            throw _e
                    }
                }
                return _arr
            }
            return function(arr, i) {
                if (Array.isArray(arr))
                    return arr;
                if (Symbol.iterator in Object(arr))
                    return sliceIterator(arr, i);
                throw new TypeError("Invalid attempt to destructure non-iterable instance")
            }
        }()
          , _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj
        }
        : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol ? "symbol" : typeof obj
        }
          , _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.CommandSet = exports.Command = void 0,
        exports.updateCommands = updateCommands,
        exports.selectedNodeAttr = selectedNodeAttr;
        var _browserkeymap = require("browserkeymap")
          , _browserkeymap2 = _interopRequireDefault(_browserkeymap)
          , _model = require("../model")
          , _transform = require("../transform")
          , _dom = require("../dom")
          , _sortedinsert = require("../util/sortedinsert")
          , _sortedinsert2 = _interopRequireDefault(_sortedinsert)
          , _obj = require("../util/obj")
          , _base_commands = require("./base_commands")
          , Command = exports.Command = function() {
            function Command(spec, self, name) {
                if (_classCallCheck(this, Command),
                this.name = name,
                !this.name)
                    throw new RangeError("Trying to define a command without a name");
                this.spec = spec,
                this.self = self
            }
            return _createClass(Command, [{
                key: "exec",
                value: function(pm, params) {
                    var run = this.spec.run;
                    if (params) {
                        if (this.params.length != (params ? params.length : 0))
                            throw new RangeError("Invalid amount of parameters for command " + this.name);
                        return run.call.apply(run, [this.self, pm].concat(_toConsumableArray(params)))
                    }
                    return this.params.length ? new pm.options.commandParamPrompt(pm,this).open() : run.call(this.self, pm)
                }
            }, {
                key: "select",
                value: function(pm) {
                    var f = this.spec.select;
                    return f ? f.call(this.self, pm) : !0
                }
            }, {
                key: "active",
                value: function(pm) {
                    var f = this.spec.active;
                    return f ? f.call(this.self, pm) : !1
                }
            }, {
                key: "params",
                get: function() {
                    return this.spec.params || empty
                }
            }, {
                key: "label",
                get: function() {
                    return this.spec.label || this.name
                }
            }]),
            Command
        }()
          , empty = []
          , CommandSet = function() {
            function CommandSet(base, op) {
                _classCallCheck(this, CommandSet),
                this.base = base,
                this.op = op
            }
            return _createClass(CommandSet, [{
                key: "add",
                value: function(set, filter) {
                    return new CommandSet(this,function(commands, schema) {
                        function add(name, spec, self) {
                            if (!filter || filter(name, spec)) {
                                if (commands[name])
                                    throw new RangeError("Duplicate definition of command " + name);
                                commands[name] = new Command(spec,self,name)
                            }
                        }
                        if ("schema" === set)
                            schema.registry("command", function(name, spec, type, typeName) {
                                add(typeName + ":" + name, deriveCommandSpec(type, spec, name), type)
                            });
                        else
                            for (var name in set)
                                add(name, set[name])
                    }
                    )
                }
            }, {
                key: "update",
                value: function(_update) {
                    return new CommandSet(this,function(commands) {
                        for (var name in _update) {
                            var spec = _update[name];
                            if (spec)
                                if (spec.run)
                                    commands[name] = new Command(spec,null,name);
                                else {
                                    var known = commands[name];
                                    known && (commands[name] = new Command((0,
                                    _obj.copyObj)(spec, (0,
                                    _obj.copyObj)(known.spec)),known.self,name))
                                }
                            else
                                delete commands[name]
                        }
                    }
                    )
                }
            }, {
                key: "derive",
                value: function(schema) {
                    var commands = this.base ? this.base.derive(schema) : Object.create(null);
                    return this.op(commands, schema),
                    commands
                }
            }]),
            CommandSet
        }();
        exports.CommandSet = CommandSet,
        CommandSet.empty = new CommandSet(null,function() {
            return null
        }
        ),
        CommandSet["default"] = CommandSet.empty.add("schema").add(_base_commands.baseCommands),
        _model.NodeType.derivableCommands = Object.create(null),
        _model.MarkType.derivableCommands = Object.create(null),
        _model.MarkType.derivableCommands.set = function(conf) {
            return {
                run: function(pm) {
                    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _len > _key; _key++)
                        params[_key - 1] = arguments[_key];
                    pm.setMark(this, !0, fillAttrs(conf, params))
                },
                select: function(pm) {
                    return conf.inverseSelect ? markApplies(pm, this) && !markActive(pm, this) : canAddInline(pm, this)
                },
                params: deriveParams(this, conf.params)
            }
        }
        ,
        _model.MarkType.derivableCommands.unset = function() {
            return {
                run: function(pm) {
                    pm.setMark(this, !1)
                },
                select: function(pm) {
                    return markActive(pm, this)
                }
            }
        }
        ,
        _model.MarkType.derivableCommands.toggle = function() {
            return {
                run: function(pm) {
                    pm.setMark(this, null)
                },
                active: function(pm) {
                    return markActive(pm, this)
                },
                select: function(pm) {
                    return markApplies(pm, this)
                }
            }
        }
        ,
        _model.NodeType.derivableCommands.wrap = function(conf) {
            return {
                run: function(pm) {
                    var _pm$selection4 = pm.selection
                      , from = _pm$selection4.from
                      , to = _pm$selection4.to
                      , head = _pm$selection4.head
                      , doJoin = !1
                      , $from = pm.doc.resolve(from);
                    if (conf.list && head && isAtTopOfListItem(pm.doc, from, to, this)) {
                        if (0 == $from.index($from.depth - 2))
                            return !1;
                        doJoin = !0
                    }
                    for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _len2 > _key2; _key2++)
                        params[_key2 - 1] = arguments[_key2];
                    var tr = pm.tr.wrap(from, to, this, fillAttrs(conf, params));
                    return doJoin && tr.join($from.before($from.depth - 1)),
                    tr.apply(pm.apply.scroll)
                },
                select: function(pm) {
                    var _pm$selection5 = pm.selection
                      , from = _pm$selection5.from
                      , to = _pm$selection5.to
                      , head = _pm$selection5.head
                      , $from = void 0;
                    return conf.list && head && isAtTopOfListItem(pm.doc, from, to, this) && 0 == ($from = pm.doc.resolve(from)).index($from.depth - 2) ? !1 : (0,
                    _transform.canWrap)(pm.doc, from, to, this)
                },
                params: deriveParams(this, conf.params)
            }
        }
        ,
        _model.NodeType.derivableCommands.make = function(conf) {
            return {
                run: function(pm) {
                    var _pm$selection7 = pm.selection
                      , from = _pm$selection7.from
                      , to = _pm$selection7.to;
                    return pm.tr.setBlockType(from, to, this, conf.attrs).apply(pm.apply.scroll)
                },
                select: function(pm) {
                    var _pm$selection8 = pm.selection
                      , from = _pm$selection8.from
                      , to = _pm$selection8.to
                      , node = _pm$selection8.node;
                    return node ? node.isTextblock && !node.hasMarkup(this, conf.attrs) : !alreadyHasBlockType(pm.doc, from, to, this, conf.attrs)
                },
                active: function(pm) {
                    return activeTextblockIs(pm, this, conf.attrs)
                }
            }
        }
        ,
        _model.NodeType.derivableCommands.insert = function(conf) {
            return {
                run: function(pm) {
                    for (var _len3 = arguments.length, params = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _len3 > _key3; _key3++)
                        params[_key3 - 1] = arguments[_key3];
                    return pm.tr.replaceSelection(this.create(fillAttrs(conf, params))).apply(pm.apply.scroll)
                },
                select: this.isInline ? function(pm) {
                    return pm.doc.resolve(pm.selection.from).parent.type.canContainType(this)
                }
                : null,
                params: deriveParams(this, conf.params)
            }
        }
    }
    , {
        "../dom": 1,
        "../model": 34,
        "../transform": 41,
        "../util/obj": 55,
        "../util/sortedinsert": 56,
        "./base_commands": 2,
        browserkeymap: 57
    }],
    6: [function(require, module, exports) {
        "use strict";
        var _dom = require("../dom");
        (0,
        _dom.insertCSS)('\n\n.ProseMirror {\n  border: 1px solid silver;\n  position: relative;\n}\n\n.ProseMirror-content {\n  padding: 4px 8px 4px 14px;\n  white-space: pre-wrap;\n  line-height: 1.2;\n}\n\n.ProseMirror-drop-target {\n  position: absolute;\n  width: 1px;\n  background: #666;\n}\n\n.ProseMirror-content ul.tight p, .ProseMirror-content ol.tight p {\n  margin: 0;\n}\n\n.ProseMirror-content ul, .ProseMirror-content ol {\n  padding-left: 30px;\n  cursor: default;\n}\n\n.ProseMirror-content blockquote {\n  padding-left: 1em;\n  border-left: 3px solid #eee;\n  margin-left: 0; margin-right: 0;\n}\n\n.ProseMirror-content pre {\n  white-space: pre-wrap;\n}\n\n.ProseMirror-selectednode {\n  outline: 2px solid #8cf;\n}\n\n.ProseMirror-nodeselection *::selection { background: transparent; }\n.ProseMirror-nodeselection *::-moz-selection { background: transparent; }\n\n.ProseMirror-content p:first-child,\n.ProseMirror-content h1:first-child,\n.ProseMirror-content h2:first-child,\n.ProseMirror-content h3:first-child,\n.ProseMirror-content h4:first-child,\n.ProseMirror-content h5:first-child,\n.ProseMirror-content h6:first-child {\n  margin-top: .3em;\n}\n\n/* Add space around the hr to make clicking it easier */\n\n.ProseMirror-content hr {\n  position: relative;\n  height: 6px;\n  border: none;\n}\n\n.ProseMirror-content hr:after {\n  content: "";\n  position: absolute;\n  left: 10px;\n  right: 10px;\n  top: 2px;\n  border-top: 2px solid silver;\n}\n\n.ProseMirror-content img {\n  cursor: default;\n}\n\n/* Make sure li selections wrap around markers */\n\n.ProseMirror-content li {\n  position: relative;\n  pointer-events: none; /* Don\'t do weird stuff with marker clicks */\n}\n.ProseMirror-content li > * {\n  pointer-events: auto;\n}\n\nli.ProseMirror-selectednode {\n  outline: none;\n}\n\nli.ProseMirror-selectednode:after {\n  content: "";\n  position: absolute;\n  left: -32px;\n  right: -2px; top: -2px; bottom: -2px;\n  border: 2px solid #8cf;\n  pointer-events: none;\n}\n\n');
    }
    , {
        "../dom": 1
    }],
    7: [function(require, module, exports) {
        "use strict";
        function readInputChange(pm) {
            return pm.ensureOperation({
                readSelection: !1
            }),
            readDOMChange(pm, rangeAroundSelection(pm))
        }
        function readCompositionChange(pm, margin) {
            return readDOMChange(pm, rangeAroundComposition(pm, margin))
        }
        function parseBetween(pm, from, to) {
            for (var _DOMFromPos = (0,
            _dompos.DOMFromPos)(pm, from, !0), parent = _DOMFromPos.node, startOff = _DOMFromPos.offset, endOff = (0,
            _dompos.DOMFromPos)(pm, to, !0).offset; startOff; ) {
                var prev = parent.childNodes[startOff - 1];
                if (1 == prev.nodeType && prev.hasAttribute("pm-offset"))
                    break;
                --startOff
            }
            for (; endOff < parent.childNodes.length; ) {
                var next = parent.childNodes[endOff];
                if (1 == next.nodeType && next.hasAttribute("pm-offset"))
                    break;
                ++endOff
            }
            return (0,
            _format.fromDOM)(pm.schema, parent, {
                topNode: pm.doc.resolve(from).parent.copy(),
                from: startOff,
                to: endOff,
                preserveWhitespace: !0,
                editableContent: !0
            })
        }
        function isAtEnd($pos, depth) {
            for (var i = depth || 0; i < $pos.depth; i++)
                if ($pos.index(i) + 1 < $pos.node(i).childCount)
                    return !1;
            return $pos.parentOffset == $pos.parent.content.size
        }
        function isAtStart($pos, depth) {
            for (var i = depth || 0; i < $pos.depth; i++)
                if ($pos.index(0) > 0)
                    return !1;
            return 0 == $pos.parentOffset
        }
        function rangeAroundSelection(pm) {
            var _pm$operation = pm.operation
              , sel = _pm$operation.sel
              , doc = _pm$operation.doc
              , $from = doc.resolve(sel.from)
              , $to = doc.resolve(sel.to);
            if ($from.sameParent($to) && $from.parent.isTextblock && $from.parentOffset && $to.parentOffset < $to.parent.content.size)
                return rangeAroundComposition(pm, 0);
            for (var depth = 0; ; depth++) {
                var fromStart = isAtStart($from, depth + 1)
                  , toEnd = isAtEnd($to, depth + 1);
                if (fromStart || toEnd || $from.index(depth) != $to.index(depth) || $to.node(depth).isTextblock) {
                    var from = $from.before(depth + 1)
                      , to = $to.after(depth + 1);
                    return fromStart && $from.index(depth) > 0 && (from -= $from.node(depth).child($from.index(depth) - 1).nodeSize),
                    toEnd && $to.index(depth) + 1 < $to.node(depth).childCount && (to += $to.node(depth).child($to.index(depth) + 1).nodeSize),
                    {
                        from: from,
                        to: to
                    }
                }
            }
        }
        function rangeAroundComposition(pm, margin) {
            var _pm$operation2 = pm.operation
              , sel = _pm$operation2.sel
              , doc = _pm$operation2.doc
              , $from = doc.resolve(sel.from)
              , $to = doc.resolve(sel.to);
            if (!$from.sameParent($to))
                return rangeAroundSelection(pm);
            var startOff = Math.max(0, $from.parentOffset - margin)
              , size = $from.parent.content.size
              , endOff = Math.min(size, $to.parentOffset + margin);
            if (startOff > 0 && (startOff = $from.parent.childBefore(startOff).offset),
            size > endOff) {
                var after = $from.parent.childAfter(endOff);
                endOff = after.offset + after.node.nodeSize
            }
            var nodeStart = $from.start($from.depth);
            return {
                from: nodeStart + startOff,
                to: nodeStart + endOff
            }
        }
        function readDOMChange(pm, range) {
            var op = pm.operation;
            if (op.docSet)
                return void pm.markAllDirty();
            var parsed = parseBetween(pm, range.from, range.to)
              , compare = op.doc.slice(range.from, range.to)
              , change = findDiff(compare.content, parsed.content, range.from, op.sel.from);
            if (change) {
                var fromMapped = (0,
                _map.mapThroughResult)(op.mappings, change.start)
                  , toMapped = (0,
                _map.mapThroughResult)(op.mappings, change.endA);
                if (!fromMapped.deleted || !toMapped.deleted) {
                    markDirtyFor(pm, op.doc, change.start, change.endA);
                    var $from = parsed.resolveNoCache(change.start - range.from)
                      , $to = parsed.resolveNoCache(change.endB - range.from)
                      , nextSel = void 0
                      , text = void 0;
                    if (!$from.sameParent($to) && $from.pos < parsed.content.size && (nextSel = (0,
                    _selection.findSelectionFrom)(parsed, $from.pos + 1, 1, !0)) && nextSel.head == $to.pos)
                        pm.input.dispatchKey("Enter");
                    else if ($from.sameParent($to) && $from.parent.isTextblock && null != (text = uniformTextBetween(parsed, $from.pos, $to.pos)))
                        pm.input.insertText(fromMapped.pos, toMapped.pos, text);
                    else {
                        var slice = parsed.slice(change.start - range.from, change.endB - range.from);
                        pm.tr.replace(fromMapped.pos, toMapped.pos, slice).apply(pm.apply.scroll)
                    }
                }
            }
        }
        function uniformTextBetween(node, from, to) {
            var result = ""
              , valid = !0
              , marks = null;
            return node.nodesBetween(from, to, function(node, pos) {
                if (node.isInline || !(from > pos)) {
                    if (!node.isText)
                        return valid = !1;
                    marks ? _model.Mark.sameSet(marks, node.marks) || (valid = !1) : marks = node.marks,
                    result += node.text.slice(Math.max(0, from - pos), to - pos)
                }
            }),
            valid ? result : null
        }
        function findDiff(a, b, pos, preferedStart) {
            var start = (0,
            _model.findDiffStart)(a, b, pos);
            if (!start)
                return null;
            var _findDiffEnd = (0,
            _model.findDiffEnd)(a, b, pos + a.size, pos + b.size)
              , endA = _findDiffEnd.a
              , endB = _findDiffEnd.b;
            if (start > endA) {
                var move = start >= preferedStart && preferedStart >= endA ? start - preferedStart : 0;
                start -= move,
                endB = start + (endB - endA),
                endA = start
            } else if (start > endB) {
                var move = start >= preferedStart && preferedStart >= endB ? start - preferedStart : 0;
                start -= move,
                endA = start + (endA - endB),
                endB = start
            }
            return {
                start: start,
                endA: endA,
                endB: endB
            }
        }
        function markDirtyFor(pm, doc, start, end) {
            var $start = doc.resolve(start)
              , $end = doc.resolve(end)
              , same = $start.sameDepth($end);
            0 == same ? pm.markAllDirty() : pm.markRangeDirty($start.before(same), $start.after(same), doc)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.readInputChange = readInputChange,
        exports.readCompositionChange = readCompositionChange;
        var _model = require("../model")
          , _format = require("../format")
          , _map = require("../transform/map")
          , _selection = require("./selection")
          , _dompos = require("./dompos")
    }
    , {
        "../format": 21,
        "../model": 34,
        "../transform/map": 43,
        "./dompos": 8,
        "./selection": 17
    }],
    8: [function(require, module, exports) {
        "use strict";
        function posBeforeFromDOM(pm, node) {
            for (var pos = 0, add = 0, cur = node; cur != pm.content; cur = cur.parentNode) {
                var attr = cur.getAttribute("pm-offset");
                attr && (pos += +attr + add,
                add = 1)
            }
            return pos
        }
        function posFromDOM(pm, dom, domOffset) {
            if (pm.operation && pm.doc != pm.operation.doc)
                throw new RangeError("Fetching a position from an outdated DOM structure");
            null == domOffset && (domOffset = Array.prototype.indexOf.call(dom.parentNode.childNodes, dom),
            dom = dom.parentNode);
            for (var innerOffset = 0, tag = void 0; ; ) {
                var adjust = 0;
                if (3 == dom.nodeType)
                    innerOffset += domOffset;
                else {
                    if (tag = dom.getAttribute("pm-offset") && !childContainer(dom)) {
                        var size = +dom.getAttribute("pm-size");
                        return posBeforeFromDOM(pm, dom) + (domOffset == dom.childNodes.length ? size : Math.min(innerOffset, size))
                    }
                    if (dom.hasAttribute("pm-container"))
                        break;
                    (tag = dom.getAttribute("pm-inner-offset")) ? (innerOffset += +tag,
                    adjust = -1) : domOffset && domOffset == dom.childNodes.length && (adjust = 1)
                }
                var parent = dom.parentNode;
                domOffset = 0 > adjust ? 0 : Array.prototype.indexOf.call(parent.childNodes, dom) + adjust,
                dom = parent
            }
            for (var start = dom == pm.content ? 0 : posBeforeFromDOM(pm, dom) + 1, before = 0, child = dom.childNodes[domOffset - 1]; child; child = child.previousSibling)
                if (1 == child.nodeType && (tag = child.getAttribute("pm-offset"))) {
                    before += +tag + +child.getAttribute("pm-size");
                    break
                }
            return start + before + innerOffset
        }
        function childContainer(dom) {
            return dom.hasAttribute("pm-container") ? dom : dom.querySelector("[pm-container]")
        }
        function DOMFromPos(pm, pos, liberal) {
            if (!liberal && pm.operation && pm.doc != pm.operation.doc)
                throw new RangeError("Resolving a position in an outdated DOM structure");
            for (var container = pm.content, offset = pos; ; )
                for (var child = container.firstChild, i = 0; ; child = child.nextSibling,
                i++) {
                    if (!child) {
                        if (offset && !liberal)
                            throw new RangeError("Failed to find node at " + pos + " rem = " + offset);
                        return {
                            node: container,
                            offset: i
                        }
                    }
                    var size = 1 == child.nodeType && child.getAttribute("pm-size");
                    if (size) {
                        if (!offset)
                            return {
                                node: container,
                                offset: i
                            };
                        if (size = +size,
                        size > offset) {
                            if (container = childContainer(child)) {
                                offset--;
                                break
                            }
                            return leafAt(child, offset)
                        }
                        offset -= size
                    }
                }
        }
        function DOMAfterPos(pm, pos) {
            var _DOMFromPos = DOMFromPos(pm, pos)
              , node = _DOMFromPos.node
              , offset = _DOMFromPos.offset;
            if (1 != node.nodeType || offset == node.childNodes.length)
                throw new RangeError("No node after pos " + pos);
            return node.childNodes[offset]
        }
        function leafAt(node, offset) {
            for (; ; ) {
                var child = node.firstChild;
                if (!child)
                    return {
                        node: node,
                        offset: offset
                    };
                if (1 != child.nodeType)
                    return {
                        node: child,
                        offset: offset
                    };
                if (child.hasAttribute("pm-inner-offset")) {
                    for (var nodeOffset = 0; ; ) {
                        var nextSib = child.nextSibling
                          , nextOffset = void 0;
                        if (!nextSib || (nextOffset = +nextSib.getAttribute("pm-inner-offset")) >= offset)
                            break;
                        child = nextSib,
                        nodeOffset = nextOffset
                    }
                    offset -= nodeOffset
                }
                node = child
            }
        }
        function windowRect() {
            return {
                left: 0,
                right: window.innerWidth,
                top: 0,
                bottom: window.innerHeight
            }
        }
        function scrollIntoView(pm, pos) {
            pos || (pos = pm.sel.range.head || pm.sel.range.from);
            for (var coords = coordsAtPos(pm, pos), parent = pm.content; ; parent = parent.parentNode) {
                var atBody = parent == document.body
                  , rect = atBody ? windowRect() : parent.getBoundingClientRect()
                  , moveX = 0
                  , moveY = 0;
                if (coords.top < rect.top ? moveY = -(rect.top - coords.top + scrollMargin) : coords.bottom > rect.bottom && (moveY = coords.bottom - rect.bottom + scrollMargin),
                coords.left < rect.left ? moveX = -(rect.left - coords.left + scrollMargin) : coords.right > rect.right && (moveX = coords.right - rect.right + scrollMargin),
                (moveX || moveY) && (atBody ? window.scrollBy(moveX, moveY) : (moveY && (parent.scrollTop += moveY),
                moveX && (parent.scrollLeft += moveX))),
                atBody)
                    break
            }
        }
        function findOffsetInNode(node, coords) {
            for (var closest = void 0, dyClosest = 1e8, coordsClosest = void 0, offset = 0, child = node.firstChild; child; child = child.nextSibling) {
                var rects = void 0;
                if (1 == child.nodeType)
                    rects = child.getClientRects();
                else {
                    if (3 != child.nodeType)
                        continue;
                    rects = textRects(child)
                }
                for (var i = 0; i < rects.length; i++) {
                    var rect = rects[i];
                    if (rect.left <= coords.left && rect.right >= coords.left) {
                        var dy = rect.top > coords.top ? rect.top - coords.top : rect.bottom < coords.top ? coords.top - rect.bottom : 0;
                        if (dyClosest > dy) {
                            closest = child,
                            dyClosest = dy,
                            coordsClosest = dy ? {
                                left: coords.left,
                                top: rect.top
                            } : coords,
                            1 != child.nodeType || child.firstChild || (offset = i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0));
                            continue
                        }
                    }
                    !closest && (coords.top >= rect.bottom || coords.top >= rect.top && coords.left >= rect.right) && (offset = i + 1)
                }
            }
            return closest ? 3 == closest.nodeType ? findOffsetInText(closest, coordsClosest) : closest.firstChild ? findOffsetInNode(closest, coordsClosest) : {
                node: node,
                offset: offset
            } : {
                node: node,
                offset: offset
            }
        }
        function findOffsetInText(node, coords) {
            for (var len = node.nodeValue.length, range = document.createRange(), i = 0; len > i; i++) {
                range.setEnd(node, i + 1),
                range.setStart(node, i);
                var rect = range.getBoundingClientRect();
                if (rect.top != rect.bottom && rect.left - 1 <= coords.left && rect.right + 1 >= coords.left && rect.top - 1 <= coords.top && rect.bottom + 1 >= coords.top)
                    return {
                        node: node,
                        offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0)
                    }
            }
            return {
                node: node,
                offset: 0
            }
        }
        function posAtCoords(pm, coords) {
            var elt = document.elementFromPoint(coords.left, coords.top + 1);
            if (!(0,
            _dom.contains)(pm.content, elt))
                return null;
            elt.firstChild || (elt = elt.parentNode);
            var _findOffsetInNode = findOffsetInNode(elt, coords)
              , node = _findOffsetInNode.node
              , offset = _findOffsetInNode.offset;
            return posFromDOM(pm, node, offset)
        }
        function textRect(node, from, to) {
            var range = document.createRange();
            return range.setEnd(node, to),
            range.setStart(node, from),
            range.getBoundingClientRect()
        }
        function textRects(node) {
            var range = document.createRange();
            return range.setEnd(node, node.nodeValue.length),
            range.setStart(node, 0),
            range.getClientRects()
        }
        function coordsAtPos(pm, pos) {
            var _DOMFromPos2 = DOMFromPos(pm, pos)
              , node = _DOMFromPos2.node
              , offset = _DOMFromPos2.offset
              , side = void 0
              , rect = void 0;
            if (3 == node.nodeType)
                offset < node.nodeValue.length && (rect = textRect(node, offset, offset + 1),
                side = "left"),
                rect && rect.left != rect.right || !offset || (rect = textRect(node, offset - 1, offset),
                side = "right");
            else if (node.firstChild) {
                if (offset < node.childNodes.length) {
                    var child = node.childNodes[offset];
                    rect = 3 == child.nodeType ? textRect(child, 0, child.nodeValue.length) : child.getBoundingClientRect(),
                    side = "left"
                }
                if ((!rect || rect.left == rect.right) && offset) {
                    var child = node.childNodes[offset - 1];
                    rect = 3 == child.nodeType ? textRect(child, 0, child.nodeValue.length) : child.getBoundingClientRect(),
                    side = "right"
                }
            } else
                rect = node.getBoundingClientRect(),
                side = "left";
            var x = rect[side];
            return {
                top: rect.top,
                bottom: rect.bottom,
                left: x,
                right: x
            }
        }
        function selectableNodeAbove(pm, dom, coords, liberal) {
            for (; dom && dom != pm.content; dom = dom.parentNode)
                if (dom.hasAttribute("pm-offset")) {
                    var pos = posBeforeFromDOM(pm, dom)
                      , node = pm.doc.nodeAt(pos);
                    if (node.type.countCoordsAsChild) {
                        var result = node.type.countCoordsAsChild(node, pos, dom, coords);
                        if (null != result)
                            return result
                    }
                    if ((liberal || null == node.type.contains) && node.type.selectable)
                        return pos;
                    if (!liberal)
                        return null
                }
        }
        function handleNodeClick(pm, type, event, target, direct) {
            for (var dom = target; dom && dom != pm.content; dom = dom.parentNode)
                if (dom.hasAttribute("pm-offset")) {
                    var pos = posBeforeFromDOM(pm, dom)
                      , node = pm.doc.nodeAt(pos)
                      , handled = node.type[type] && node.type[type](pm, event, pos, node) !== !1;
                    if (direct || handled)
                        return handled
                }
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.posBeforeFromDOM = posBeforeFromDOM,
        exports.posFromDOM = posFromDOM,
        exports.childContainer = childContainer,
        exports.DOMFromPos = DOMFromPos,
        exports.DOMAfterPos = DOMAfterPos,
        exports.scrollIntoView = scrollIntoView,
        exports.posAtCoords = posAtCoords,
        exports.coordsAtPos = coordsAtPos,
        exports.selectableNodeAbove = selectableNodeAbove,
        exports.handleNodeClick = handleNodeClick;
        var _dom = require("../dom")
          , scrollMargin = 5
    }
    , {
        "../dom": 1
    }],
    9: [function(require, module, exports) {
        "use strict";
        function options(ranges) {
            return {
                pos: 0,
                preRenderContent: function() {
                    this.pos++
                },
                postRenderContent: function() {
                    this.pos++
                },
                onRender: function(node, dom, offset) {
                    return node.isBlock && (null != offset && dom.setAttribute("pm-offset", offset),
                    dom.setAttribute("pm-size", node.nodeSize),
                    node.isTextblock && adjustTrailingHacks(dom, node),
                    "false" == dom.contentEditable && (dom = (0,
                    _dom.elt)("div", null, dom)),
                    node.type.contains || this.pos++),
                    dom
                },
                onContainer: function(node) {
                    node.setAttribute("pm-container", !0)
                },
                renderInlineFlat: function(node, dom, offset) {
                    ranges.advanceTo(this.pos);
                    for (var pos = this.pos, end = pos + node.nodeSize, nextCut = ranges.nextChangeBefore(end), inner = dom, wrapped = void 0, i = 0; i < node.marks.length; i++)
                        inner = inner.firstChild;
                    1 != dom.nodeType && (dom = (0,
                    _dom.elt)("span", null, dom),
                    -1 == nextCut && (wrapped = dom)),
                    !wrapped && (nextCut > -1 || ranges.current.length) && (wrapped = inner == dom ? dom = (0,
                    _dom.elt)("span", null, inner) : inner.parentNode.appendChild((0,
                    _dom.elt)("span", null, inner))),
                    dom.setAttribute("pm-offset", offset),
                    dom.setAttribute("pm-size", node.nodeSize);
                    for (var inlineOffset = 0; nextCut > -1; ) {
                        var size = nextCut - pos
                          , split = splitSpan(wrapped, size);
                        ranges.current.length && (split.className = ranges.current.join(" ")),
                        split.setAttribute("pm-inner-offset", inlineOffset),
                        inlineOffset += size,
                        ranges.advanceTo(nextCut),
                        nextCut = ranges.nextChangeBefore(end),
                        -1 == nextCut && wrapped.setAttribute("pm-inner-offset", inlineOffset),
                        pos += size
                    }
                    return ranges.current.length && (wrapped.className = ranges.current.join(" ")),
                    this.pos += node.nodeSize,
                    dom
                },
                document: document
            }
        }
        function splitSpan(span, at) {
            var textNode = span.firstChild
              , text = textNode.nodeValue
              , newNode = span.parentNode.insertBefore((0,
            _dom.elt)("span", null, text.slice(0, at)), span);
            return textNode.nodeValue = text.slice(at),
            newNode
        }
        function draw(pm, doc) {
            pm.content.textContent = "",
            pm.content.appendChild((0,
            _format.toDOM)(doc, options(pm.ranges.activeRangeTracker())))
        }
        function adjustTrailingHacks(dom, node) {
            var needs = 0 == node.content.size || node.lastChild.type.isBR || node.type.isCode && node.lastChild.isText && /\n$/.test(node.lastChild.text) ? "br" : node.lastChild.isText || null != node.lastChild.type.contains ? null : "text"
              , last = dom.lastChild
              , has = last && 1 == last.nodeType && last.hasAttribute("pm-ignore") ? "BR" == last.nodeName ? "br" : "text" : null;
            needs != has && (has && dom.removeChild(last),
            needs && dom.appendChild("br" == needs ? (0,
            _dom.elt)("br", {
                "pm-ignore": "trailing-break"
            }) : (0,
            _dom.elt)("span", {
                "pm-ignore": "cursor-text"
            }, "")))
        }
        function findNodeIn(parent, i, node) {
            for (; i < parent.childCount; i++) {
                var child = parent.child(i);
                if (child == node)
                    return i
            }
            return -1
        }
        function movePast(dom) {
            var next = dom.nextSibling;
            return dom.parentNode.removeChild(dom),
            next
        }
        function redraw(pm, dirty, doc, prev) {
            function scan(dom, node, prev, pos) {
                for (var iPrev = 0, pChild = prev.firstChild, domPos = dom.firstChild, iNode = 0, offset = 0; iNode < node.childCount; iNode++) {
                    var child = node.child(iNode)
                      , matching = void 0
                      , reuseDOM = void 0
                      , found = pChild == child ? iPrev : findNodeIn(prev, iPrev + 1, child);
                    if (found > -1)
                        for (matching = child; iPrev != found; )
                            iPrev++,
                            domPos = movePast(domPos);
                    if (matching && !dirty.get(matching))
                        reuseDOM = !0;
                    else if (pChild && !child.isText && child.sameMarkup(pChild) && dirty.get(pChild) != _main.DIRTY_REDRAW)
                        reuseDOM = !0,
                        pChild.type.contains && scan((0,
                        _dompos.childContainer)(domPos), child, pChild, pos + offset + 1);
                    else {
                        opts.pos = pos + offset;
                        var rendered = (0,
                        _format.nodeToDOM)(child, opts, offset);
                        dom.insertBefore(rendered, domPos),
                        reuseDOM = !1
                    }
                    reuseDOM && (domPos.setAttribute("pm-offset", offset),
                    domPos.setAttribute("pm-size", child.nodeSize),
                    domPos = domPos.nextSibling,
                    pChild = prev.maybeChild(++iPrev)),
                    offset += child.nodeSize
                }
                for (; pChild; )
                    domPos = movePast(domPos),
                    pChild = prev.maybeChild(++iPrev);
                node.isTextblock && adjustTrailingHacks(dom, node)
            }
            if (dirty.get(prev) == _main.DIRTY_REDRAW)
                return draw(pm, doc);
            var opts = options(pm.ranges.activeRangeTracker());
            scan(pm.content, doc, prev, 0)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.draw = draw,
        exports.redraw = redraw;
        var _format = require("../format")
          , _dom = require("../dom")
          , _main = require("./main")
          , _dompos = require("./dompos")
    }
    , {
        "../dom": 1,
        "../format": 21,
        "./dompos": 8,
        "./main": 13
    }],
    10: [function(require, module, exports) {
        "use strict";
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.History = void 0;
        var _transform = require("../transform")
          , max_empty_items = 500
          , Branch = function() {
            function Branch(maxEvents) {
                _classCallCheck(this, Branch),
                this.events = 0,
                this.maxEvents = maxEvents,
                this.items = [new Item]
            }
            return _createClass(Branch, [{
                key: "popEvent",
                value: function(doc, preserveItems, upto) {
                    for (var preserve = preserveItems, transform = new _transform.Transform(doc), remap = new BranchRemapping, selection = void 0, ids = [], i = this.items.length; ; ) {
                        var cur = this.items[--i];
                        if (upto && cur == upto)
                            break;
                        if (!cur.map)
                            return null;
                        if (cur.step) {
                            if (preserve) {
                                var step = cur.step.map(remap.remap)
                                  , map = void 0;
                                this.items[i] = new MapItem(cur.map),
                                step && transform.maybeStep(step).doc && (map = transform.maps[transform.maps.length - 1],
                                this.items.push(new MapItem(map,this.items[i].id))),
                                remap.movePastStep(cur, map)
                            } else
                                this.items.pop(),
                                transform.maybeStep(cur.step);
                            if (ids.push(cur.id),
                            cur.selection && (this.events--,
                            !upto)) {
                                selection = cur.selection.type.mapToken(cur.selection, remap.remap);
                                break
                            }
                        } else
                            remap.add(cur),
                            preserve = !0
                    }
                    return {
                        transform: transform,
                        selection: selection,
                        ids: ids
                    }
                }
            }, {
                key: "clear",
                value: function() {
                    this.items.length = 1,
                    this.events = 0
                }
            }, {
                key: "addTransform",
                value: function(transform, selection, ids) {
                    for (var i = 0; i < transform.steps.length; i++) {
                        var step = transform.steps[i].invert(transform.docs[i]);
                        this.items.push(new StepItem(transform.maps[i],ids && ids[i],step,selection)),
                        selection && (this.events++,
                        selection = null)
                    }
                    this.events > this.maxEvents && this.clip()
                }
            }, {
                key: "clip",
                value: function() {
                    for (var seen = 0, toClip = this.events - this.maxEvents, i = 0; ; i++) {
                        var cur = this.items[i];
                        if (cur.selection) {
                            if (!(toClip > seen))
                                return this.items.splice(0, i, new Item(null,this.events[toClip - 1])),
                                void (this.events = this.maxEvents);
                            ++seen
                        }
                    }
                }
            }, {
                key: "addMaps",
                value: function(array) {
                    if (0 != this.events)
                        for (var i = 0; i < array.length; i++)
                            this.items.push(new MapItem(array[i]))
                }
            }, {
                key: "findChangeID",
                value: function(id) {
                    if (id == this.items[0].id)
                        return this.items[0];
                    for (var i = this.items.length - 1; i >= 0; i--) {
                        var cur = this.items[i];
                        if (cur.step) {
                            if (cur.id == id)
                                return cur;
                            if (cur.id < id)
                                return null
                        }
                    }
                }
            }, {
                key: "rebased",
                value: function(newMaps, rebasedTransform, positions) {
                    if (0 != this.events) {
                        var rebasedItems = []
                          , start = this.items.length - positions.length
                          , startPos = 0;
                        if (1 > start && (startPos = 1 - start,
                        start = 1,
                        this.items[0] = new Item),
                        positions.length) {
                            for (var remap = new _transform.Remapping([],newMaps.slice()), iItem = start, iPosition = startPos; iItem < this.items.length; iItem++) {
                                var item = this.items[iItem]
                                  , pos = positions[iPosition++]
                                  , id = void 0;
                                if (-1 != pos) {
                                    var map = rebasedTransform.maps[pos];
                                    if (item.step) {
                                        var step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos])
                                          , selection = item.selection && item.selection.type.mapToken(item.selection, remap);
                                        rebasedItems.push(new StepItem(map,item.id,step,selection))
                                    } else
                                        rebasedItems.push(new MapItem(map));
                                    id = remap.addToBack(map)
                                }
                                remap.addToFront(item.map.invert(), id)
                            }
                            this.items.length = start
                        }
                        for (var i = 0; i < newMaps.length; i++)
                            this.items.push(new MapItem(newMaps[i]));
                        for (var i = 0; i < rebasedItems.length; i++)
                            this.items.push(rebasedItems[i]);
                        !this.compressing && this.emptyItems(start) + newMaps.length > max_empty_items && this.compress(start + newMaps.length)
                    }
                }
            }, {
                key: "emptyItems",
                value: function(upto) {
                    for (var count = 0, i = 1; upto > i; i++)
                        this.items[i].step || count++;
                    return count
                }
            }, {
                key: "compress",
                value: function(upto) {
                    for (var remap = new BranchRemapping, items = [], events = 0, i = this.items.length - 1; i >= 0; i--) {
                        var item = this.items[i];
                        if (i >= upto)
                            items.push(item);
                        else if (item.step) {
                            var step = item.step.map(remap.remap)
                              , map = step && step.posMap();
                            if (remap.movePastStep(item, map),
                            step) {
                                var selection = item.selection && item.selection.type.mapToken(item.selection, remap.remap);
                                items.push(new StepItem(map.invert(),item.id,step,selection)),
                                selection && events++
                            }
                        } else
                            item.map ? remap.add(item) : items.push(item)
                    }
                    this.items = items.reverse(),
                    this.events = events
                }
            }, {
                key: "toString",
                value: function() {
                    return this.items.join("\n")
                }
            }, {
                key: "changeID",
                get: function() {
                    for (var i = this.items.length - 1; i > 0; i--)
                        if (this.items[i].step)
                            return this.items[i].id;
                    return this.items[0].id
                }
            }]),
            Branch
        }()
          , nextID = 1
          , Item = function() {
            function Item(map, id) {
                _classCallCheck(this, Item),
                this.map = map,
                this.id = id || nextID++
            }
            return _createClass(Item, [{
                key: "toString",
                value: function() {
                    return this.id + ":" + (this.map || "") + (this.step ? ":" + this.step : "") + (null != this.mirror ? "->" + this.mirror : "")
                }
            }]),
            Item
        }()
          , StepItem = function(_Item) {
            function StepItem(map, id, step, selection) {
                _classCallCheck(this, StepItem);
                var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StepItem).call(this, map, id));
                return _this.step = step,
                _this.selection = selection,
                _this
            }
            return _inherits(StepItem, _Item),
            StepItem
        }(Item)
          , MapItem = function(_Item2) {
            function MapItem(map, mirror) {
                _classCallCheck(this, MapItem);
                var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MapItem).call(this, map));
                return _this2.mirror = mirror,
                _this2
            }
            return _inherits(MapItem, _Item2),
            MapItem
        }(Item)
          , BranchRemapping = function() {
            function BranchRemapping() {
                _classCallCheck(this, BranchRemapping),
                this.remap = new _transform.Remapping,
                this.mirrorBuffer = Object.create(null)
            }
            return _createClass(BranchRemapping, [{
                key: "add",
                value: function(item) {
                    var id = this.remap.addToFront(item.map, this.mirrorBuffer[item.id]);
                    return null != item.mirror && (this.mirrorBuffer[item.mirror] = id),
                    id
                }
            }, {
                key: "movePastStep",
                value: function(item, map) {
                    var id = this.add(item);
                    map && this.remap.addToBack(map, id)
                }
            }]),
            BranchRemapping
        }();
        exports.History = function() {
            function History(pm) {
                _classCallCheck(this, History),
                this.pm = pm,
                this.done = new Branch(pm.options.historyDepth),
                this.undone = new Branch(pm.options.historyDepth),
                this.lastAddedAt = 0,
                this.ignoreTransform = !1,
                this.preserveItems = 0,
                pm.on("transform", this.recordTransform.bind(this))
            }
            return _createClass(History, [{
                key: "recordTransform",
                value: function(transform, selection, options) {
                    if (!this.ignoreTransform)
                        if (0 == options.addToHistory)
                            this.done.addMaps(transform.maps),
                            this.undone.addMaps(transform.maps);
                        else {
                            var now = Date.now()
                              , newGroup = now > this.lastAddedAt + this.pm.options.historyEventDelay;
                            this.done.addTransform(transform, newGroup ? selection.token : null),
                            this.undone.clear(),
                            this.lastAddedAt = now
                        }
                }
            }, {
                key: "undo",
                value: function() {
                    return this.shift(this.done, this.undone)
                }
            }, {
                key: "redo",
                value: function() {
                    return this.shift(this.undone, this.done)
                }
            }, {
                key: "shift",
                value: function(from, to) {
                    var pop = from.popEvent(this.pm.doc, this.preserveItems > 0);
                    if (!pop)
                        return !1;
                    var selectionBeforeTransform = this.pm.selection;
                    if (!pop.transform.steps.length)
                        return this.shift(from, to);
                    var selection = pop.selection.type.fromToken(pop.selection, pop.transform.doc);
                    return this.applyIgnoring(pop.transform, selection),
                    to.addTransform(pop.transform, selectionBeforeTransform.token, pop.ids),
                    this.lastAddedAt = 0,
                    !0
                }
            }, {
                key: "applyIgnoring",
                value: function(transform, selection) {
                    this.ignoreTransform = !0,
                    this.pm.apply(transform, {
                        selection: selection,
                        filter: !1
                    }),
                    this.ignoreTransform = !1
                }
            }, {
                key: "getVersion",
                value: function() {
                    return this.done.changeID
                }
            }, {
                key: "isAtVersion",
                value: function(version) {
                    return this.done.changeID == version
                }
            }, {
                key: "backToVersion",
                value: function(version) {
                    var found = this.done.findChangeID(version);
                    if (!found)
                        return !1;
                    var _done$popEvent = this.done.popEvent(this.pm.doc, this.preserveItems > 0, found)
                      , transform = _done$popEvent.transform;
                    return this.applyIgnoring(transform),
                    this.undone.clear(),
                    !0
                }
            }, {
                key: "rebased",
                value: function(newMaps, rebasedTransform, positions) {
                    this.done.rebased(newMaps, rebasedTransform, positions),
                    this.undone.rebased(newMaps, rebasedTransform, positions)
                }
            }, {
                key: "undoDepth",
                get: function() {
                    return this.done.events
                }
            }, {
                key: "redoDepth",
                get: function() {
                    return this.undone.events
                }
            }]),
            History
        }()
    }
    , {
        "../transform": 41
    }],
    11: [function(require, module, exports) {
        "use strict";
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            }
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Keymap = exports.baseCommands = exports.Command = exports.CommandSet = exports.MarkedRange = exports.NodeSelection = exports.TextSelection = exports.Selection = exports.defineOption = exports.ProseMirror = void 0;
        var _main = require("./main");
        Object.defineProperty(exports, "ProseMirror", {
            enumerable: !0,
            get: function() {
                return _main.ProseMirror
            }
        });
        var _options = require("./options");
        Object.defineProperty(exports, "defineOption", {
            enumerable: !0,
            get: function() {
                return _options.defineOption
            }
        });
        var _selection = require("./selection");
        Object.defineProperty(exports, "Selection", {
            enumerable: !0,
            get: function() {
                return _selection.Selection
            }
        }),
        Object.defineProperty(exports, "TextSelection", {
            enumerable: !0,
            get: function() {
                return _selection.TextSelection
            }
        }),
        Object.defineProperty(exports, "NodeSelection", {
            enumerable: !0,
            get: function() {
                return _selection.NodeSelection
            }
        });
        var _range = require("./range");
        Object.defineProperty(exports, "MarkedRange", {
            enumerable: !0,
            get: function() {
                return _range.MarkedRange
            }
        });
        var _command = require("./command");
        Object.defineProperty(exports, "CommandSet", {
            enumerable: !0,
            get: function() {
                return _command.CommandSet
            }
        }),
        Object.defineProperty(exports, "Command", {
            enumerable: !0,
            get: function() {
                return _command.Command
            }
        });
        var _base_commands = require("./base_commands");
        Object.defineProperty(exports, "baseCommands", {
            enumerable: !0,
            get: function() {
                return _base_commands.baseCommands
            }
        }),
        require("./schema_commands");
        var _browserkeymap = require("browserkeymap")
          , _browserkeymap2 = _interopRequireDefault(_browserkeymap);
        exports.Keymap = _browserkeymap2["default"]
    }
    , {
        "./base_commands": 2,
        "./command": 5,
        "./main": 13,
        "./options": 14,
        "./range": 15,
        "./schema_commands": 16,
        "./selection": 17,
        browserkeymap: 57
    }],
    12: [function(require, module, exports) {
        "use strict";
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            }
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function realTarget(pm, mouseEvent) {
            return pm.operation && pm.flush() ? document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY) : mouseEvent.target
        }
        function selectClickedNode(pm, e, target) {
            var pos = (0,
            _dompos.selectableNodeAbove)(pm, target, {
                left: e.clientX,
                top: e.clientY
            }, !0);
            if (null == pos)
                return pm.sel.fastPoll();
            var _pm$selection = pm.selection
              , node = _pm$selection.node
              , from = _pm$selection.from;
            if (node) {
                var $pos = pm.doc.resolve(pos)
                  , $from = pm.doc.resolve(from);
                if ($pos.depth >= $from.depth && $pos.before($from.depth) == from) {
                    if (0 == $from.depth)
                        return pm.sel.fastPoll();
                    pos = $pos.before($pos.depth)
                }
            }
            pm.setNodeSelection(pos),
            pm.focus(),
            e.preventDefault()
        }
        function handleTripleClick(pm, e, target) {
            e.preventDefault();
            var pos = (0,
            _dompos.selectableNodeAbove)(pm, target, {
                left: e.clientX,
                top: e.clientY
            }, !0);
            if (null != pos) {
                var $pos = pm.doc.resolve(pos)
                  , node = $pos.nodeAfter;
                node.isBlock && !node.isTextblock ? pm.setNodeSelection(pos) : node.isInline ? pm.setTextSelection($pos.start($pos.depth), $pos.end($pos.depth)) : pm.setTextSelection(pos + 1, pos + 1 + node.content.size),
                pm.focus()
            }
        }
        function toClipboard(doc, from, to, dataTransfer) {
            var slice = doc.slice(from, to)
              , $from = doc.resolve(from)
              , parent = $from.node($from.depth - slice.openLeft)
              , attr = parent.type.name + " " + slice.openLeft + " " + slice.openRight
              , html = '<div pm-context="' + attr + '">' + (0,
            _format.toHTML)(slice.content) + "</div>";
            return dataTransfer.clearData(),
            dataTransfer.setData("text/html", html),
            dataTransfer.setData("text/plain", (0,
            _format.toText)(slice.content)),
            slice
        }
        function canUpdateClipboard(dataTransfer) {
            return null != cachedCanUpdateClipboard ? cachedCanUpdateClipboard : (dataTransfer.setData("text/html", "<hr>"),
            cachedCanUpdateClipboard = "<hr>" == dataTransfer.getData("text/html"))
        }
        function fromClipboard(pm, dataTransfer, plainText) {
            var txt = dataTransfer.getData("text/plain")
              , html = dataTransfer.getData("text/html");
            if (!html && !txt)
                return null;
            var doc = void 0
              , slice = void 0;
            if (!plainText && html || !txt) {
                var dom = document.createElement("div");
                dom.innerHTML = pm.signalPipelined("transformPastedHTML", html);
                var wrap = dom.querySelector("[pm-context]")
                  , context = void 0
                  , contextNodeType = void 0
                  , found = void 0;
                wrap && (context = /^(\w+) (\d+) (\d+)$/.exec(wrap.getAttribute("pm-context"))) && (contextNodeType = pm.schema.nodes[context[1]]) && contextNodeType.defaultAttrs && (found = parseFromContext(wrap, contextNodeType, +context[2], +context[3])) ? slice = found : doc = (0,
                _format.fromDOM)(pm.schema, dom)
            } else
                doc = (0,
                _format.parseFrom)(pm.schema, pm.signalPipelined("transformPastedText", txt), "text");
            return slice || (slice = doc.slice((0,
            _selection.findSelectionAtStart)(doc).from, (0,
            _selection.findSelectionAtEnd)(doc).to)),
            pm.signalPipelined("transformPasted", slice)
        }
        function parseFromContext(dom, contextNodeType, openLeft, openRight) {
            var schema = contextNodeType.schema
              , contextNode = contextNodeType.create()
              , parsed = (0,
            _format.fromDOM)(schema, dom, {
                topNode: contextNode,
                preserveWhitespace: !0
            });
            return new _model.Slice(parsed.content,clipOpen(parsed.content, openLeft, !0),clipOpen(parsed.content, openRight, !1),contextNode)
        }
        function clipOpen(fragment, max, start) {
            for (var i = 0; max > i; i++) {
                var node = start ? fragment.firstChild : fragment.lastChild;
                if (!node || null == node.type.contains)
                    return i;
                fragment = node.content
            }
            return max
        }
        function dropPos(pm, e, slice) {
            var pos = pm.posAtCoords({
                left: e.clientX,
                top: e.clientY
            });
            if (null == pos || !slice || !slice.content.size)
                return pos;
            for (var $pos = pm.doc.resolve(pos), kind = slice.content.leastSuperKind(), d = $pos.depth; d >= 0; d--)
                if (kind.isSubKind($pos.node(d).type.contains))
                    return d == $pos.depth ? pos : pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? $pos.before(d + 1) : $pos.after(d + 1);
            return pos
        }
        function removeDropTarget(pm) {
            pm.input.dropTarget && (pm.wrapper.removeChild(pm.input.dropTarget),
            pm.input.dropTarget = null)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Input = void 0;
        var _model = require("../model")
          , _browserkeymap = require("browserkeymap")
          , _browserkeymap2 = _interopRequireDefault(_browserkeymap)
          , _format = require("../format")
          , _capturekeys = require("./capturekeys")
          , _dom = require("../dom")
          , _domchange = require("./domchange")
          , _selection = require("./selection")
          , _dompos = require("./dompos")
          , stopSeq = null
          , handlers = {};
        exports.Input = function() {
            function Input(pm) {
                var _this = this;
                _classCallCheck(this, Input),
                this.pm = pm,
                this.baseKeymap = null,
                this.keySeq = null,
                this.mouseDown = null,
                this.dragging = null,
                this.dropTarget = null,
                this.shiftKey = !1,
                this.finishComposing = null,
                this.keymaps = [],
                this.defaultKeymap = null,
                this.storedMarks = null;
                var _loop = function(event) {
                    var handler = handlers[event];
                    pm.content.addEventListener(event, function(e) {
                        return handler(pm, e)
                    })
                };
                for (var event in handlers)
                    _loop(event);
                pm.on("selectionChange", function() {
                    return _this.storedMarks = null
                })
            }
            return _createClass(Input, [{
                key: "dispatchKey",
                value: function(name, e) {
                    var pm = this.pm
                      , seq = pm.input.keySeq;
                    if (seq) {
                        if (_browserkeymap2["default"].isModifierKey(name))
                            return !0;
                        clearTimeout(stopSeq),
                        stopSeq = setTimeout(function() {
                            pm.input.keySeq == seq && (pm.input.keySeq = null)
                        }, 50),
                        name = seq + " " + name
                    }
                    for (var handle = function handle(bound) {
                        if (bound === !1)
                            return "nothing";
                        if ("..." == bound)
                            return "multi";
                        if (null == bound)
                            return !1;
                        var result = !1;
                        if (Array.isArray(bound))
                            for (var i = 0; result === !1 && i < bound.length; i++)
                                result = handle(bound[i]);
                        else
                            result = "string" == typeof bound ? pm.execCommand(bound) : bound(pm);
                        return 0 == result ? !1 : "handled"
                    }, result = void 0, i = 0; !result && i < pm.input.keymaps.length; i++)
                        result = handle(pm.input.keymaps[i].map.lookup(name, pm));
                    return result || (result = handle(pm.input.baseKeymap.lookup(name, pm)) || handle(_capturekeys.captureKeys.lookup(name))),
                    "multi" == result && (pm.input.keySeq = name),
                    "handled" != result && "multi" != result || !e || e.preventDefault(),
                    seq && !result && /\'$/.test(name) ? (e && e.preventDefault(),
                    !0) : !!result
                }
            }, {
                key: "insertText",
                value: function(from, to, text) {
                    if (from != to || text) {
                        var pm = this.pm
                          , marks = pm.input.storedMarks || pm.doc.marksAt(from)
                          , tr = pm.tr.replaceWith(from, to, text ? pm.schema.text(text, marks) : null);
                        tr.apply({
                            scrollIntoView: !0,
                            selection: (0,
                            _selection.findSelectionNear)(tr.doc, tr.map(to), -1, !0)
                        }),
                        text && pm.signal("textInput", text)
                    }
                }
            }, {
                key: "startComposition",
                value: function(dataLen, realStart) {
                    this.pm.ensureOperation({
                        noFlush: !0,
                        readSelection: realStart
                    }).composing = {
                        ended: !1,
                        applied: !1,
                        margin: dataLen
                    },
                    this.pm.unscheduleFlush()
                }
            }, {
                key: "applyComposition",
                value: function(andFlush) {
                    var composing = this.composing;
                    composing.applied || ((0,
                    _domchange.readCompositionChange)(this.pm, composing.margin),
                    composing.applied = !0,
                    andFlush && this.pm.flush())
                }
            }, {
                key: "composing",
                get: function() {
                    return this.pm.operation && this.pm.operation.composing
                }
            }]),
            Input
        }();
        handlers.keydown = function(pm, e) {
            if ((0,
            _selection.hasFocus)(pm) && (pm.signal("interaction"),
            16 == e.keyCode && (pm.input.shiftKey = !0),
            !pm.input.composing)) {
                var name = _browserkeymap2["default"].keyName(e);
                name && pm.input.dispatchKey(name, e) || pm.sel.fastPoll()
            }
        }
        ,
        handlers.keyup = function(pm, e) {
            16 == e.keyCode && (pm.input.shiftKey = !1)
        }
        ,
        handlers.keypress = function(pm, e) {
            if (!(!(0,
            _selection.hasFocus)(pm) || pm.input.composing || !e.charCode || e.ctrlKey && !e.altKey || _dom.browser.mac && e.metaKey || pm.input.dispatchKey(_browserkeymap2["default"].keyName(e), e))) {
                var sel = pm.selection;
                _dom.browser.ios || (pm.input.insertText(sel.from, sel.to, String.fromCharCode(e.charCode)),
                e.preventDefault())
            }
        }
        ;
        var lastClick = 0
          , oneButLastClick = 0;
        handlers.mousedown = function(pm, e) {
            pm.signal("interaction");
            var now = Date.now()
              , doubleClick = 500 > now - lastClick
              , tripleClick = 600 > now - oneButLastClick;
            oneButLastClick = lastClick,
            lastClick = now;
            var target = realTarget(pm, e);
            tripleClick ? handleTripleClick(pm, e, target) : doubleClick && (0,
            _dompos.handleNodeClick)(pm, "handleDoubleClick", e, target, !0) || (pm.input.mouseDown = new MouseDown(pm,e,target,doubleClick))
        }
        ;
        var MouseDown = function() {
            function MouseDown(pm, event, target, doubleClick) {
                _classCallCheck(this, MouseDown),
                this.pm = pm,
                this.event = event,
                this.target = target,
                this.leaveToBrowser = pm.input.shiftKey || doubleClick;
                var pos = (0,
                _dompos.posBeforeFromDOM)(pm, this.target)
                  , node = pm.doc.nodeAt(pos);
                this.mightDrag = node.type.draggable || node == pm.sel.range.node ? pos : null,
                null != this.mightDrag && (this.target.draggable = !0,
                _dom.browser.gecko && (this.setContentEditable = !this.target.hasAttribute("contentEditable")) && this.target.setAttribute("contentEditable", "false")),
                this.x = event.clientX,
                this.y = event.clientY,
                window.addEventListener("mouseup", this.up = this.up.bind(this)),
                window.addEventListener("mousemove", this.move = this.move.bind(this)),
                pm.sel.fastPoll()
            }
            return _createClass(MouseDown, [{
                key: "done",
                value: function() {
                    window.removeEventListener("mouseup", this.up),
                    window.removeEventListener("mousemove", this.move),
                    null != this.mightDrag && (this.target.draggable = !1,
                    _dom.browser.gecko && this.setContentEditable && this.target.removeAttribute("contentEditable"))
                }
            }, {
                key: "up",
                value: function(event) {
                    this.done();
                    var target = realTarget(this.pm, event);
                    if (this.leaveToBrowser || !(0,
                    _dom.contains)(this.pm.content, target))
                        this.pm.sel.fastPoll();
                    else if (this.event.ctrlKey)
                        selectClickedNode(this.pm, event, target);
                    else if (!(0,
                    _dompos.handleNodeClick)(this.pm, "handleClick", event, target, !0)) {
                        var pos = (0,
                        _dompos.selectableNodeAbove)(this.pm, target, {
                            left: this.x,
                            top: this.y
                        });
                        pos ? (this.pm.setNodeSelection(pos),
                        this.pm.focus()) : this.pm.sel.fastPoll()
                    }
                }
            }, {
                key: "move",
                value: function(event) {
                    !this.leaveToBrowser && (Math.abs(this.x - event.clientX) > 4 || Math.abs(this.y - event.clientY) > 4) && (this.leaveToBrowser = !0),
                    this.pm.sel.fastPoll()
                }
            }]),
            MouseDown
        }();
        handlers.touchdown = function(pm) {
            pm.sel.fastPoll()
        }
        ,
        handlers.contextmenu = function(pm, e) {
            (0,
            _dompos.handleNodeClick)(pm, "handleContextMenu", e, realTarget(pm, e), !1)
        }
        ,
        handlers.compositionstart = function(pm, e) {
            !pm.input.composing && (0,
            _selection.hasFocus)(pm) && pm.input.startComposition(e.data ? e.data.length : 0, !0)
        }
        ,
        handlers.compositionupdate = function(pm) {
            !pm.input.composing && (0,
            _selection.hasFocus)(pm) && pm.input.startComposition(0, !1)
        }
        ,
        handlers.compositionend = function(pm, e) {
            if ((0,
            _selection.hasFocus)(pm)) {
                var composing = pm.input.composing;
                if (composing) {
                    if (composing.applied)
                        return
                } else {
                    if (!e.data)
                        return;
                    pm.input.startComposition(e.data.length, !1)
                }
                clearTimeout(pm.input.finishComposing),
                pm.operation.composing.ended = !0,
                pm.input.finishComposing = window.setTimeout(function() {
                    var composing = pm.input.composing;
                    composing && composing.ended && pm.input.applyComposition(!0)
                }, 20)
            }
        }
        ,
        handlers.input = function(pm) {
            if ((0,
            _selection.hasFocus)(pm)) {
                var composing = pm.input.composing;
                if (composing)
                    return void (composing.ended && pm.input.applyComposition(!0));
                (0,
                _domchange.readInputChange)(pm),
                pm.flush()
            }
        }
        ;
        var cachedCanUpdateClipboard = null;
        handlers.copy = handlers.cut = function(pm, e) {
            var _pm$selection2 = pm.selection
              , from = _pm$selection2.from
              , to = _pm$selection2.to
              , empty = _pm$selection2.empty;
            !empty && e.clipboardData && canUpdateClipboard(e.clipboardData) && (toClipboard(pm.doc, from, to, e.clipboardData),
            e.preventDefault(),
            "cut" != e.type || empty || pm.tr["delete"](from, to).apply())
        }
        ,
        handlers.paste = function(pm, e) {
            if ((0,
            _selection.hasFocus)(pm) && e.clipboardData) {
                var sel = pm.selection
                  , slice = fromClipboard(pm, e.clipboardData, pm.input.shiftKey);
                slice && (e.preventDefault(),
                pm.tr.replace(sel.from, sel.to, slice).apply(pm.apply.scroll))
            }
        }
        ;
        var Dragging = function Dragging(slice, from, to) {
            _classCallCheck(this, Dragging),
            this.slice = slice,
            this.from = from,
            this.to = to
        };
        handlers.dragstart = function(pm, e) {
            var mouseDown = pm.input.mouseDown;
            if (mouseDown && mouseDown.done(),
            e.dataTransfer) {
                var _pm$selection3 = pm.selection
                  , from = _pm$selection3.from
                  , to = _pm$selection3.to
                  , empty = _pm$selection3.empty
                  , dragging = void 0
                  , pos = !empty && pm.posAtCoords({
                    left: e.clientX,
                    top: e.clientY
                });
                if (null != pos && pos >= from && to >= pos)
                    dragging = {
                        from: from,
                        to: to
                    };
                else if (mouseDown && null != mouseDown.mightDrag) {
                    var _pos = mouseDown.mightDrag;
                    dragging = {
                        from: _pos,
                        to: _pos + pm.doc.nodeAt(_pos).nodeSize
                    }
                }
                if (dragging) {
                    var slice = toClipboard(pm.doc, dragging.from, dragging.to, e.dataTransfer);
                    pm.input.dragging = new Dragging(slice,dragging.from,dragging.to)
                }
            }
        }
        ,
        handlers.dragend = function(pm) {
            return window.setTimeout(function() {
                return pm.input.dragging = null
            }, 50)
        }
        ,
        handlers.dragover = handlers.dragenter = function(pm, e) {
            e.preventDefault();
            var target = pm.input.dropTarget;
            target || (target = pm.input.dropTarget = pm.wrapper.appendChild((0,
            _dom.elt)("div", {
                "class": "ProseMirror-drop-target"
            })));
            var pos = dropPos(pm, e, pm.input.dragging && pm.input.dragging.slice);
            if (null != pos) {
                var coords = pm.coordsAtPos(pos)
                  , rect = pm.wrapper.getBoundingClientRect();
                coords.top -= rect.top,
                coords.right -= rect.left,
                coords.bottom -= rect.top,
                coords.left -= rect.left,
                target.style.left = coords.left - 1 + "px",
                target.style.top = coords.top + "px",
                target.style.height = coords.bottom - coords.top + "px"
            }
        }
        ,
        handlers.dragleave = function(pm, e) {
            e.target == pm.content && removeDropTarget(pm)
        }
        ,
        handlers.drop = function(pm, e) {
            var dragging = pm.input.dragging;
            if (pm.input.dragging = null,
            removeDropTarget(pm),
            e.dataTransfer && !pm.signalDOM(e)) {
                var slice = dragging && dragging.slice || fromClipboard(pm, e.dataTransfer);
                if (slice) {
                    e.preventDefault();
                    var insertPos = dropPos(pm, e, slice)
                      , start = insertPos;
                    if (null == insertPos)
                        return;
                    var tr = pm.tr;
                    dragging && !e.ctrlKey && null != dragging.from && (tr["delete"](dragging.from, dragging.to),
                    insertPos = tr.map(insertPos)),
                    tr.replace(insertPos, insertPos, slice).apply();
                    var found = void 0;
                    if (1 == slice.content.childCount && 0 == slice.openLeft && 0 == slice.openRight && slice.content.child(0).type.selectable && (found = pm.doc.nodeAt(insertPos)) && found.sameMarkup(slice.content.child(0)))
                        pm.setNodeSelection(insertPos);
                    else {
                        var left = (0,
                        _selection.findSelectionNear)(pm.doc, insertPos, 1, !0).from
                          , right = (0,
                        _selection.findSelectionNear)(pm.doc, tr.map(start), -1, !0).to;
                        pm.setTextSelection(left, right)
                    }
                    pm.focus()
                }
            }
        }
        ,
        handlers.focus = function(pm) {
            pm.wrapper.classList.add("ProseMirror-focused"),
            pm.signal("focus")
        }
        ,
        handlers.blur = function(pm) {
            pm.wrapper.classList.remove("ProseMirror-focused"),
            pm.signal("blur")
        }
    }
    , {
        "../dom": 1,
        "../format": 21,
        "../model": 34,
        "./capturekeys": 3,
        "./domchange": 7,
        "./dompos": 8,
        "./selection": 17,
        browserkeymap: 57
    }],
    13: [function(require, module, exports) {
        "use strict";
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            }
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.DIRTY_REDRAW = exports.DIRTY_RESCAN = exports.ProseMirror = void 0,
        require("./css");
        var _browserkeymap = require("browserkeymap")
          , _browserkeymap2 = _interopRequireDefault(_browserkeymap)
          , _sortedinsert = require("../util/sortedinsert")
          , _sortedinsert2 = _interopRequireDefault(_sortedinsert)
          , _map = require("../util/map")
          , _event = require("../util/event")
          , _dom = require("../dom")
          , _format = require("../format")
          , _options = require("./options")
          , _selection = require("./selection")
          , _dompos = require("./dompos")
          , _draw = require("./draw")
          , _input = require("./input")
          , _history = require("./history")
          , _range = require("./range")
          , _transform = require("./transform")
          , ProseMirror = exports.ProseMirror = function() {
            function ProseMirror(opts) {
                _classCallCheck(this, ProseMirror),
                (0,
                _dom.ensureCSSAdded)(),
                opts = this.options = (0,
                _options.parseOptions)(opts),
                this.schema = opts.schema,
                null == opts.doc && (opts.doc = this.schema.node("doc", null, [this.schema.node("paragraph")])),
                this.content = (0,
                _dom.elt)("div", {
                    "class": "ProseMirror-content",
                    "pm-container": !0
                }),
                this.wrapper = (0,
                _dom.elt)("div", {
                    "class": "ProseMirror"
                }, this.content),
                this.wrapper.ProseMirror = this,
                opts.place && opts.place.appendChild ? opts.place.appendChild(this.wrapper) : opts.place && opts.place(this.wrapper),
                this.setDocInner(opts.docFormat ? (0,
                _format.parseFrom)(this.schema, opts.doc, opts.docFormat) : opts.doc),
                (0,
                _draw.draw)(this, this.doc),
                this.content.contentEditable = !0,
                opts.label && this.content.setAttribute("aria-label", opts.label),
                this.mod = Object.create(null),
                this.cached = Object.create(null),
                this.operation = null,
                this.dirtyNodes = new _map.Map,
                this.flushScheduled = null,
                this.sel = new _selection.SelectionState(this,(0,
                _selection.findSelectionAtStart)(this.doc)),
                this.accurateSelection = !1,
                this.input = new _input.Input(this),
                this.commands = null,
                this.commandKeys = null,
                (0,
                _options.initOptions)(this)
            }
            return _createClass(ProseMirror, [{
                key: "setOption",
                value: function(name, value) {
                    (0,
                    _options.setOption)(this, name, value),
                    this.signal("optionChanged", name, value)
                }
            }, {
                key: "getOption",
                value: function(name) {
                    return this.options[name]
                }
            }, {
                key: "setTextSelection",
                value: function(anchor) {
                    var head = arguments.length <= 1 || void 0 === arguments[1] ? anchor : arguments[1];
                    this.checkPos(head, !0),
                    anchor != head && this.checkPos(anchor, !0),
                    this.setSelection(new _selection.TextSelection(anchor,head))
                }
            }, {
                key: "setNodeSelection",
                value: function(pos) {
                    this.checkPos(pos, !1);
                    var node = this.doc.nodeAt(pos);
                    if (!node)
                        throw new RangeError("Trying to set a node selection that doesn't point at a node");
                    if (!node.type.selectable)
                        throw new RangeError("Trying to select a non-selectable node");
                    this.setSelection(new _selection.NodeSelection(pos,pos + node.nodeSize,node))
                }
            }, {
                key: "setSelection",
                value: function(selection) {
                    this.ensureOperation(),
                    selection.eq(this.sel.range) || this.sel.setAndSignal(selection)
                }
            }, {
                key: "setContent",
                value: function(value, format) {
                    format && (value = (0,
                    _format.parseFrom)(this.schema, value, format)),
                    this.setDoc(value)
                }
            }, {
                key: "getContent",
                value: function(format) {
                    return format ? (0,
                    _format.serializeTo)(this.doc, format) : this.doc
                }
            }, {
                key: "setDocInner",
                value: function(doc) {
                    if (doc.type != this.schema.nodes.doc)
                        throw new RangeError("Trying to set a document with a different schema");
                    this.doc = doc,
                    this.ranges = new _range.RangeStore(this),
                    this.history = new _history.History(this)
                }
            }, {
                key: "setDoc",
                value: function(doc, sel) {
                    sel || (sel = (0,
                    _selection.findSelectionAtStart)(doc)),
                    this.signal("beforeSetDoc", doc, sel),
                    this.ensureOperation(),
                    this.setDocInner(doc),
                    this.operation.docSet = !0,
                    this.sel.set(sel, !0),
                    this.signal("setDoc", doc, sel)
                }
            }, {
                key: "updateDoc",
                value: function(doc, mapping, selection) {
                    this.ensureOperation(),
                    this.ranges.transform(mapping),
                    this.operation.mappings.push(mapping),
                    this.doc = doc,
                    this.sel.setAndSignal(selection || this.sel.range.map(doc, mapping)),
                    this.signal("change")
                }
            }, {
                key: "apply",
                value: function(transform) {
                    var options = arguments.length <= 1 || void 0 === arguments[1] ? nullOptions : arguments[1];
                    if (!transform.steps.length)
                        return !1;
                    if (!transform.docs[0].eq(this.doc))
                        throw new RangeError("Applying a transform that does not start with the current document");
                    if (options.filter !== !1 && this.signalHandleable("filterTransform", transform))
                        return !1;
                    var selectionBeforeTransform = this.selection;
                    return this.signal("beforeTransform", transform, options),
                    this.updateDoc(transform.doc, transform, options.selection),
                    this.signal("transform", transform, selectionBeforeTransform, options),
                    options.scrollIntoView && this.scrollIntoView(),
                    transform
                }
            }, {
                key: "checkPos",
                value: function(pos, textblock) {
                    var valid = pos >= 0 && pos <= this.doc.content.size;
                    if (valid && textblock && (valid = this.doc.resolve(pos).parent.isTextblock),
                    !valid)
                        throw new RangeError("Position " + pos + " is not valid in current document")
                }
            }, {
                key: "ensureOperation",
                value: function(options) {
                    return this.operation || this.startOperation(options)
                }
            }, {
                key: "startOperation",
                value: function(options) {
                    var _this = this;
                    return this.operation = new Operation(this),
                    options && options.readSelection === !1 || !this.sel.readFromDOM() || (this.operation.sel = this.sel.range),
                    null == this.flushScheduled && (this.flushScheduled = (0,
                    _dom.requestAnimationFrame)(function() {
                        return _this.flush()
                    })),
                    this.operation
                }
            }, {
                key: "unscheduleFlush",
                value: function() {
                    null != this.flushScheduled && ((0,
                    _dom.cancelAnimationFrame)(this.flushScheduled),
                    this.flushScheduled = null)
                }
            }, {
                key: "flush",
                value: function() {
                    if (this.unscheduleFlush(),
                    !document.body.contains(this.wrapper) || !this.operation)
                        return !1;
                    this.signal("flushing");
                    var op = this.operation
                      , redrawn = !1;
                    return op ? (op.composing && this.input.applyComposition(),
                    this.operation = null,
                    this.accurateSelection = !0,
                    (op.doc != this.doc || this.dirtyNodes.size) && ((0,
                    _draw.redraw)(this, this.dirtyNodes, this.doc, op.doc),
                    this.dirtyNodes.clear(),
                    redrawn = !0),
                    (redrawn || !op.sel.eq(this.sel.range) || op.focus) && this.sel.toDOM(op.focus),
                    op.scrollIntoView !== !1 && (0,
                    _dompos.scrollIntoView)(this, op.scrollIntoView),
                    redrawn && this.signal("draw"),
                    this.signal("flush"),
                    this.accurateSelection = !1,
                    redrawn) : !1
                }
            }, {
                key: "addKeymap",
                value: function(map) {
                    var rank = arguments.length <= 1 || void 0 === arguments[1] ? 50 : arguments[1];
                    (0,
                    _sortedinsert2["default"])(this.input.keymaps, {
                        map: map,
                        rank: rank
                    }, function(a, b) {
                        return a.rank - b.rank
                    })
                }
            }, {
                key: "removeKeymap",
                value: function(map) {
                    for (var maps = this.input.keymaps, i = 0; i < maps.length; ++i)
                        if (maps[i].map == map || maps[i].map.options.name == map)
                            return maps.splice(i, 1),
                            !0
                }
            }, {
                key: "markRange",
                value: function(from, to, options) {
                    this.checkPos(from),
                    this.checkPos(to);
                    var range = new _range.MarkedRange(from,to,options);
                    return this.ranges.addRange(range),
                    range
                }
            }, {
                key: "removeRange",
                value: function(range) {
                    this.ranges.removeRange(range)
                }
            }, {
                key: "setMark",
                value: function(type, to, attrs) {
                    var sel = this.selection;
                    if (sel.empty) {
                        var marks = this.activeMarks();
                        if (null == to && (to = !type.isInSet(marks)),
                        to && !this.doc.resolve(sel.head).parent.type.canContainMark(type))
                            return;
                        this.input.storedMarks = to ? type.create(attrs).addToSet(marks) : type.removeFromSet(marks),
                        this.signal("activeMarkChange")
                    } else
                        (null != to ? to : !this.doc.rangeHasMark(sel.from, sel.to, type)) ? this.apply(this.tr.addMark(sel.from, sel.to, type.create(attrs))) : this.apply(this.tr.removeMark(sel.from, sel.to, type))
                }
            }, {
                key: "activeMarks",
                value: function() {
                    var head;
                    return this.input.storedMarks || (null != (head = this.selection.head) ? this.doc.marksAt(head) : [])
                }
            }, {
                key: "focus",
                value: function() {
                    this.operation ? this.operation.focus = !0 : this.sel.toDOM(!0)
                }
            }, {
                key: "hasFocus",
                value: function() {
                    return this.sel.range instanceof _selection.NodeSelection ? document.activeElement == this.content : (0,
                    _selection.hasFocus)(this)
                }
            }, {
                key: "posAtCoords",
                value: function(coords) {
                    return this.flush(),
                    (0,
                    _dompos.posAtCoords)(this, coords)
                }
            }, {
                key: "coordsAtPos",
                value: function(pos) {
                    return this.checkPos(pos),
                    this.flush(),
                    (0,
                    _dompos.coordsAtPos)(this, pos)
                }
            }, {
                key: "scrollIntoView",
                value: function() {
                    var pos = arguments.length <= 0 || void 0 === arguments[0] ? null : arguments[0];
                    pos && this.checkPos(pos),
                    this.ensureOperation(),
                    this.operation.scrollIntoView = pos
                }
            }, {
                key: "execCommand",
                value: function(name, params) {
                    var cmd = this.commands[name];
                    return !(!cmd || cmd.exec(this, params) === !1)
                }
            }, {
                key: "keyForCommand",
                value: function(name) {
                    var cached = this.commandKeys[name];
                    if (void 0 !== cached)
                        return cached;
                    var cmd = this.commands[name]
                      , keymap = this.input.baseKeymap;
                    if (!cmd)
                        return this.commandKeys[name] = null;
                    var key = cmd.spec.key || (_dom.browser.mac ? cmd.spec.macKey : cmd.spec.pcKey);
                    if (key) {
                        key = _browserkeymap2["default"].normalizeKeyName(Array.isArray(key) ? key[0] : key);
                        var deflt = keymap.bindings[key];
                        if (Array.isArray(deflt) ? deflt.indexOf(name) > -1 : deflt == name)
                            return this.commandKeys[name] = key
                    }
                    for (var _key in keymap.bindings) {
                        var bound = keymap.bindings[_key];
                        if (Array.isArray(bound) ? bound.indexOf(name) > -1 : bound == name)
                            return this.commandKeys[name] = _key
                    }
                    return this.commandKeys[name] = null
                }
            }, {
                key: "markRangeDirty",
                value: function(from, to) {
                    var doc = arguments.length <= 2 || void 0 === arguments[2] ? this.doc : arguments[2];
                    this.ensureOperation();
                    for (var dirty = this.dirtyNodes, $from = doc.resolve(from), $to = doc.resolve(to), same = $from.sameDepth($to), depth = 0; same >= depth; depth++) {
                        var child = $from.node(depth);
                        dirty.has(child) || dirty.set(child, DIRTY_RESCAN)
                    }
                    for (var start = $from.index(same), end = Math.max(start + 1, $to.index(same) + (same == $to.depth ? 0 : 1)), parent = $from.node(same), i = start; end > i; i++)
                        dirty.set(parent.child(i), DIRTY_REDRAW)
                }
            }, {
                key: "markAllDirty",
                value: function() {
                    this.dirtyNodes.set(this.doc, DIRTY_REDRAW)
                }
            }, {
                key: "translate",
                value: function(string) {
                    var trans = this.options.translate;
                    return trans ? trans(string) : string
                }
            }, {
                key: "selection",
                get: function() {
                    return this.accurateSelection || this.ensureOperation(),
                    this.sel.range
                }
            }, {
                key: "tr",
                get: function() {
                    return new _transform.EditorTransform(this)
                }
            }]),
            ProseMirror
        }();
        ProseMirror.prototype.apply.scroll = {
            scrollIntoView: !0
        };
        var DIRTY_RESCAN = exports.DIRTY_RESCAN = 1
          , DIRTY_REDRAW = exports.DIRTY_REDRAW = 2
          , nullOptions = {};
        (0,
        _event.eventMixin)(ProseMirror);
        var Operation = function Operation(pm) {
            _classCallCheck(this, Operation),
            this.doc = pm.doc,
            this.docSet = !1,
            this.sel = pm.sel.range,
            this.scrollIntoView = !1,
            this.focus = !1,
            this.mappings = [],
            this.composing = null
        }
    }
    , {
        "../dom": 1,
        "../format": 21,
        "../util/event": 53,
        "../util/map": 54,
        "../util/sortedinsert": 56,
        "./css": 6,
        "./dompos": 8,
        "./draw": 9,
        "./history": 10,
        "./input": 12,
        "./options": 14,
        "./range": 15,
        "./selection": 17,
        "./transform": 18,
        browserkeymap: 57
    }],
    14: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function defineOption(name, defaultValue, update, updateOnInit) {
            options[name] = new Option(defaultValue,update,updateOnInit)
        }
        function parseOptions(obj) {
            var result = Object.create(null)
              , given = obj ? [obj].concat(obj.use || []) : [];
            outer: for (var opt in options) {
                for (var i = 0; i < given.length; i++)
                    if (opt in given[i]) {
                        result[opt] = given[i][opt];
                        continue outer
                    }
                result[opt] = options[opt].defaultValue
            }
            return result
        }
        function initOptions(pm) {
            for (var opt in options) {
                var desc = options[opt];
                desc.update && desc.updateOnInit && desc.update(pm, pm.options[opt], null, !0)
            }
        }
        function setOption(pm, name, value) {
            var desc = options[name];
            if (void 0 === desc)
                throw new RangeError("Option '" + name + "' is not defined");
            if (desc.update === !1)
                throw new RangeError("Option '" + name + "' can not be changed");
            var old = pm.options[name];
            pm.options[name] = value,
            desc.update && desc.update(pm, value, old, !1)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.defineOption = defineOption,
        exports.parseOptions = parseOptions,
        exports.initOptions = initOptions,
        exports.setOption = setOption;
        var _model = require("../model")
          , _prompt = require("../ui/prompt")
          , _command = require("./command")
          , Option = function Option(defaultValue, update, updateOnInit) {
            _classCallCheck(this, Option),
            this.defaultValue = defaultValue,
            this.update = update,
            this.updateOnInit = updateOnInit !== !1
        }
          , options = Object.create(null);
        defineOption("schema", _model.defaultSchema, !1),
        defineOption("doc", null, function(pm, value) {
            return pm.setDoc(value)
        }, !1),
        defineOption("docFormat", null),
        defineOption("place", null),
        defineOption("historyDepth", 100),
        defineOption("historyEventDelay", 500),
        defineOption("commands", _command.CommandSet["default"], _command.updateCommands),
        defineOption("commandParamPrompt", _prompt.ParamPrompt),
        defineOption("label", null),
        defineOption("translate", null)
    }
    , {
        "../model": 34,
        "../ui/prompt": 49,
        "./command": 5
    }],
    15: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.RangeStore = exports.MarkedRange = void 0;
        var _event = require("../util/event")
          , MarkedRange = exports.MarkedRange = function() {
            function MarkedRange(from, to, options) {
                _classCallCheck(this, MarkedRange),
                this.options = options || {},
                this.from = from,
                this.to = to
            }
            return _createClass(MarkedRange, [{
                key: "remove",
                value: function() {
                    this.signal("removed", this.from, Math.max(this.to, this.from)),
                    this.from = this.to = null
                }
            }]),
            MarkedRange
        }();
        (0,
        _event.eventMixin)(MarkedRange);
        var RangeSorter = function() {
            function RangeSorter() {
                _classCallCheck(this, RangeSorter),
                this.sorted = []
            }
            return _createClass(RangeSorter, [{
                key: "find",
                value: function(at) {
                    for (var min = 0, max = this.sorted.length; ; ) {
                        if (min + 10 > max) {
                            for (var i = min; max > i; i++)
                                if (this.sorted[i].at >= at)
                                    return i;
                            return max
                        }
                        var mid = min + max >> 1;
                        this.sorted[mid].at > at ? max = mid : min = mid
                    }
                }
            }, {
                key: "insert",
                value: function(obj) {
                    this.sorted.splice(this.find(obj.at), 0, obj)
                }
            }, {
                key: "remove",
                value: function(at, range) {
                    for (var pos = this.find(at), dist = 0; ; dist++) {
                        var leftPos = pos - dist - 1
                          , rightPos = pos + dist;
                        if (leftPos >= 0 && this.sorted[leftPos].range == range)
                            return void this.sorted.splice(leftPos, 1);
                        if (rightPos < this.sorted.length && this.sorted[rightPos].range == range)
                            return void this.sorted.splice(rightPos, 1)
                    }
                }
            }, {
                key: "resort",
                value: function() {
                    for (var i = 0; i < this.sorted.length; i++)
                        for (var cur = this.sorted[i], at = cur.at = "open" == cur.type ? cur.range.from : cur.range.to, pos = i; pos > 0 && this.sorted[pos - 1].at > at; )
                            this.sorted[pos] = this.sorted[pos - 1],
                            this.sorted[--pos] = cur
                }
            }]),
            RangeSorter
        }()
          , RangeTracker = (exports.RangeStore = function() {
            function RangeStore(pm) {
                _classCallCheck(this, RangeStore),
                this.pm = pm,
                this.ranges = [],
                this.sorted = new RangeSorter
            }
            return _createClass(RangeStore, [{
                key: "addRange",
                value: function(range) {
                    this.ranges.push(range),
                    this.sorted.insert({
                        type: "open",
                        at: range.from,
                        range: range
                    }),
                    this.sorted.insert({
                        type: "close",
                        at: range.to,
                        range: range
                    }),
                    range.options.className && this.pm.markRangeDirty(range.from, range.to)
                }
            }, {
                key: "removeRange",
                value: function(range) {
                    var found = this.ranges.indexOf(range);
                    found > -1 && (this.ranges.splice(found, 1),
                    this.sorted.remove(range.from, range),
                    this.sorted.remove(range.to, range),
                    range.options.className && this.pm.markRangeDirty(range.from, range.to),
                    range.remove())
                }
            }, {
                key: "transform",
                value: function(mapping) {
                    for (var i = 0; i < this.ranges.length; i++) {
                        var range = this.ranges[i];
                        range.from = mapping.map(range.from, range.options.inclusiveLeft ? -1 : 1),
                        range.to = mapping.map(range.to, range.options.inclusiveRight ? 1 : -1),
                        range.options.removeWhenEmpty !== !1 && range.from >= range.to ? (this.removeRange(range),
                        i--) : range.from > range.to && (range.to = range.from)
                    }
                    this.sorted.resort()
                }
            }, {
                key: "activeRangeTracker",
                value: function() {
                    return new RangeTracker(this.sorted.sorted)
                }
            }]),
            RangeStore
        }(),
        function() {
            function RangeTracker(sorted) {
                _classCallCheck(this, RangeTracker),
                this.sorted = sorted,
                this.pos = 0,
                this.current = []
            }
            return _createClass(RangeTracker, [{
                key: "advanceTo",
                value: function(pos) {
                    for (var next = void 0; this.pos < this.sorted.length && (next = this.sorted[this.pos]).at <= pos; ) {
                        var className = next.range.options.className;
                        className && ("open" == next.type ? this.current.push(className) : this.current.splice(this.current.indexOf(className), 1)),
                        this.pos++
                    }
                }
            }, {
                key: "nextChangeBefore",
                value: function(pos) {
                    for (; ; ) {
                        if (this.pos == this.sorted.length)
                            return -1;
                        var next = this.sorted[this.pos];
                        if (next.range.options.className)
                            return next.at >= pos ? -1 : next.at;
                        this.pos++
                    }
                }
            }]),
            RangeTracker
        }())
    }
    , {
        "../util/event": 53
    }],
    16: [function(require, module, exports) {
        "use strict";
        function selectedListItems(pm, type) {
            var _pm$selection3 = pm.selection
              , node = _pm$selection3.node
              , from = _pm$selection3.from
              , to = _pm$selection3.to
              , $from = pm.doc.resolve(from);
            if (node && node.type == type)
                return {
                    from: from,
                    to: to,
                    depth: $from.depth + 1
                };
            var itemDepth = $from.parent.type == type ? $from.depth : $from.depth > 0 && $from.node($from.depth - 1).type == type ? $from.depth - 1 : null;
            if (null != itemDepth) {
                var $to = pm.doc.resolve(to);
                return $from.sameDepth($to) < itemDepth - 1 ? null : {
                    from: $from.before(itemDepth),
                    to: $to.after(itemDepth),
                    depth: itemDepth
                }
            }
        }
        var _model = require("../model")
          , _command = require("./command")
          , _format = require("../format");
        _model.StrongMark.register("command", "set", {
            derive: !0,
            label: "Set strong"
        }),
        _model.StrongMark.register("command", "unset", {
            derive: !0,
            label: "Unset strong"
        }),
        _model.StrongMark.register("command", "toggle", {
            derive: !0,
            label: "Toggle strong",
            menu: {
                group: "inline",
                rank: 20,
                display: {
                    type: "icon",
                    width: 805,
                    height: 1024,
                    path: "M317 869q42 18 80 18 214 0 214-191 0-65-23-102-15-25-35-42t-38-26-46-14-48-6-54-1q-41 0-57 5 0 30-0 90t-0 90q0 4-0 38t-0 55 2 47 6 38zM309 442q24 4 62 4 46 0 81-7t62-25 42-51 14-81q0-40-16-70t-45-46-61-24-70-8q-28 0-74 7 0 28 2 86t2 86q0 15-0 45t-0 45q0 26 0 39zM0 950l1-53q8-2 48-9t60-15q4-6 7-15t4-19 3-18 1-21 0-19v-37q0-561-12-585-2-4-12-8t-25-6-28-4-27-2-17-1l-2-47q56-1 194-6t213-5q13 0 39 0t38 0q40 0 78 7t73 24 61 40 42 59 16 78q0 29-9 54t-22 41-36 32-41 25-48 22q88 20 146 76t58 141q0 57-20 102t-53 74-78 48-93 27-100 8q-25 0-75-1t-75-1q-60 0-175 6t-132 6z"
                }
            },
            keys: ["Mod-B"]
        }),
        _model.EmMark.register("command", "set", {
            derive: !0,
            label: "Add emphasis"
        }),
        _model.EmMark.register("command", "unset", {
            derive: !0,
            label: "Remove emphasis"
        }),
        _model.EmMark.register("command", "toggle", {
            derive: !0,
            label: "Toggle emphasis",
            menu: {
                group: "inline",
                rank: 21,
                display: {
                    type: "icon",
                    width: 585,
                    height: 1024,
                    path: "M0 949l9-48q3-1 46-12t63-21q16-20 23-57 0-4 35-165t65-310 29-169v-14q-13-7-31-10t-39-4-33-3l10-58q18 1 68 3t85 4 68 1q27 0 56-1t69-4 56-3q-2 22-10 50-17 5-58 16t-62 19q-4 10-8 24t-5 22-4 26-3 24q-15 84-50 239t-44 203q-1 5-7 33t-11 51-9 47-3 32l0 10q9 2 105 17-1 25-9 56-6 0-18 0t-18 0q-16 0-49-5t-49-5q-78-1-117-1-29 0-81 5t-69 6z"
                }
            },
            keys: ["Mod-I"]
        }),
        _model.CodeMark.register("command", "set", {
            derive: !0,
            label: "Set code style"
        }),
        _model.CodeMark.register("command", "unset", {
            derive: !0,
            label: "Remove code style"
        }),
        _model.CodeMark.register("command", "toggle", {
            derive: !0,
            label: "Toggle code style",
            menu: {
                group: "inline",
                rank: 22,
                display: {
                    type: "icon",
                    width: 896,
                    height: 1024,
                    path: "M608 192l-96 96 224 224-224 224 96 96 288-320-288-320zM288 192l-288 320 288 320 96-96-224-224 224-224-96-96z"
                }
            },
            keys: ["Mod-`"]
        });
        var linkIcon = {
            type: "icon",
            width: 951,
            height: 1024,
            path: "M832 694q0-22-16-38l-118-118q-16-16-38-16-24 0-41 18 1 1 10 10t12 12 8 10 7 14 2 15q0 22-16 38t-38 16q-8 0-15-2t-14-7-10-8-12-12-10-10q-18 17-18 41 0 22 16 38l117 118q15 15 38 15 22 0 38-14l84-83q16-16 16-38zM430 292q0-22-16-38l-117-118q-16-16-38-16-22 0-38 15l-84 83q-16 16-16 38 0 22 16 38l118 118q15 15 38 15 24 0 41-17-1-1-10-10t-12-12-8-10-7-14-2-15q0-22 16-38t38-16q8 0 15 2t14 7 10 8 12 12 10 10q18-17 18-41zM941 694q0 68-48 116l-84 83q-47 47-116 47-69 0-116-48l-117-118q-47-47-47-116 0-70 50-119l-50-50q-49 50-118 50-68 0-116-48l-118-118q-48-48-48-116t48-116l84-83q47-47 116-47 69 0 116 48l117 118q47 47 47 116 0 70-50 119l50 50q49-50 118-50 68 0 116 48l118 118q48 48 48 116z"
        };
        _model.LinkMark.register("command", "unset", {
            derive: !0,
            label: "Unlink",
            menu: {
                group: "inline",
                rank: 30,
                display: linkIcon
            },
            active: function() {
                return !0
            }
        }),
        _model.LinkMark.register("command", "set", {
            derive: {
                inverseSelect: !0,
                params: [{
                    label: "Target",
                    attr: "href"
                }, {
                    label: "Title",
                    attr: "title"
                }]
            },
            label: "Add link",
            menu: {
                group: "inline",
                rank: 30,
                display: linkIcon
            }
        }),
        _model.Image.register("command", "insert", {
            derive: {
                params: [{
                    label: "Image URL",
                    attr: "src"
                }, {
                    label: "Description / alternative text",
                    attr: "alt",
                    prefill: function(pm) {
                        return (0,
                        _command.selectedNodeAttr)(pm, this, "alt") || (0,
                        _format.toText)(pm.doc.cut(pm.selection.from, pm.selection.to))
                    }
                }, {
                    label: "Title",
                    attr: "title"
                }]
            },
            label: "Insert image",
            menu: {
                group: "insert",
                rank: 20,
                display: {
                    type: "label",
                    label: "Image"
                }
            }
        }),
        _model.BulletList.register("command", "wrap", {
            derive: {
                list: !0
            },
            label: "Wrap the selection in a bullet list",
            menu: {
                group: "block",
                rank: 40,
                display: {
                    type: "icon",
                    width: 768,
                    height: 896,
                    path: "M0 512h128v-128h-128v128zM0 256h128v-128h-128v128zM0 768h128v-128h-128v128zM256 512h512v-128h-512v128zM256 256h512v-128h-512v128zM256 768h512v-128h-512v128z"
                }
            },
            keys: ["Shift-Ctrl-8"]
        }),
        _model.OrderedList.register("command", "wrap", {
            derive: {
                list: !0
            },
            label: "Wrap the selection in an ordered list",
            menu: {
                group: "block",
                rank: 41,
                display: {
                    type: "icon",
                    width: 768,
                    height: 896,
                    path: "M320 512h448v-128h-448v128zM320 768h448v-128h-448v128zM320 128v128h448v-128h-448zM79 384h78v-256h-36l-85 23v50l43-2v185zM189 590c0-36-12-78-96-78-33 0-64 6-83 16l1 66c21-10 42-15 67-15s32 11 32 28c0 26-30 58-110 112v50h192v-67l-91 2c49-30 87-66 87-113l1-1z"
                }
            },
            keys: ["Shift-Ctrl-9"]
        }),
        _model.BlockQuote.register("command", "wrap", {
            derive: !0,
            label: "Wrap the selection in a block quote",
            menu: {
                group: "block",
                rank: 45,
                display: {
                    type: "icon",
                    width: 640,
                    height: 896,
                    path: "M0 448v256h256v-256h-128c0 0 0-128 128-128v-128c0 0-256 0-256 256zM640 320v-128c0 0-256 0-256 256v256h256v-256h-128c0 0 0-128 128-128z"
                }
            },
            keys: ["Shift-Ctrl-."]
        }),
        _model.HardBreak.register("command", "insert", {
            label: "Insert hard break",
            run: function(pm) {
                var _pm$selection = pm.selection
                  , node = _pm$selection.node
                  , from = _pm$selection.from;
                return node && node.isBlock ? !1 : pm.doc.resolve(from).parent.type.isCode ? pm.tr.typeText("\n").apply(pm.apply.scroll) : pm.tr.replaceSelection(this.create()).apply(pm.apply.scroll)
            },
            keys: {
                all: ["Mod-Enter", "Shift-Enter"],
                mac: ["Ctrl-Enter"]
            }
        }),
        _model.ListItem.register("command", "split", {
            label: "Split the current list item",
            run: function(pm) {
                var _pm$selection2 = pm.selection
                  , from = _pm$selection2.from
                  , to = _pm$selection2.to
                  , node = _pm$selection2.node
                  , $from = pm.doc.resolve(from);
                if (node && node.isBlock || $from.depth < 2 || !$from.sameParent(pm.doc.resolve(to)))
                    return !1;
                var grandParent = $from.node($from.depth - 1);
                if (grandParent.type != this)
                    return !1;
                var nextType = to == $from.end($from.depth) ? pm.schema.defaultTextblockType() : null;
                return pm.tr["delete"](from, to).split(from, 2, nextType).apply(pm.apply.scroll)
            },
            keys: ["Enter(50)"]
        }),
        _model.ListItem.register("command", "lift", {
            label: "Lift the selected list items to an outer list",
            run: function(pm) {
                var selected = selectedListItems(pm, this);
                if (!selected || selected.depth < 3)
                    return !1;
                var $to = pm.doc.resolve(pm.selection.to);
                if ($to.node(selected.depth - 2).type != this)
                    return !1;
                var itemsAfter = selected.to < $to.end(selected.depth - 1)
                  , tr = pm.tr.splitIfNeeded(selected.to, 2).splitIfNeeded(selected.from, 2)
                  , end = tr.map(selected.to, -1);
                return tr.step("ancestor", tr.map(selected.from), end, {
                    depth: 2
                }),
                itemsAfter && tr.join(end - 2),
                tr.apply(pm.apply.scroll)
            },
            keys: ["Mod-[(20)"]
        }),
        _model.ListItem.register("command", "sink", {
            label: "Sink the selected list items into an inner list",
            run: function(pm) {
                var selected = selectedListItems(pm, this);
                if (!selected)
                    return !1;
                var $from = pm.doc.resolve(pm.selection.from)
                  , startIndex = $from.index(selected.depth - 1);
                if (0 == startIndex)
                    return !1;
                var parent = $from.node(selected.depth - 1)
                  , before = parent.child(startIndex - 1)
                  , tr = pm.tr.wrap(selected.from, selected.to, parent.type, parent.attrs);
                return before.type == this && tr.join(selected.from, before.lastChild && before.lastChild.type == parent.type ? 2 : 1),
                tr.apply(pm.apply.scroll)
            },
            keys: ["Mod-](20)"]
        });
        for (var _loop = function(i) {
            _model.Heading.registerComputed("command", "make" + i, function(type) {
                var attrs = {
                    level: String(i)
                };
                return i <= type.maxLevel ? {
                    derive: {
                        name: "make",
                        attrs: attrs
                    },
                    label: "Change to heading " + i,
                    keys: 6 >= i && ["Shift-Ctrl-" + i],
                    menu: {
                        group: "textblockHeading",
                        rank: 30 + i,
                        display: {
                            type: "label",
                            label: "Level " + i
                        },
                        activeDisplay: "Head " + i
                    }
                } : void 0
            })
        }, i = 1; 10 >= i; i++)
            _loop(i);
        _model.Paragraph.register("command", "make", {
            derive: !0,
            label: "Change to paragraph",
            keys: ["Shift-Ctrl-0"],
            menu: {
                group: "textblock",
                rank: 10,
                display: {
                    type: "label",
                    label: "Plain"
                },
                activeDisplay: "Plain"
            }
        }),
        _model.CodeBlock.register("command", "make", {
            derive: !0,
            label: "Change to code block",
            keys: ["Shift-Ctrl-\\"],
            menu: {
                group: "textblock",
                rank: 20,
                display: {
                    type: "label",
                    label: "Code"
                },
                activeDisplay: "Code"
            }
        }),
        _model.HorizontalRule.register("command", "insert", {
            derive: !0,
            label: "Insert horizontal rule",
            keys: ["Mod-Shift--"],
            menu: {
                group: "insert",
                rank: 70,
                display: {
                    type: "label",
                    label: "Horizontal rule"
                }
            }
        })
    }
    , {
        "../format": 21,
        "../model": 34,
        "./command": 5
    }],
    17: [function(require, module, exports) {
        "use strict";
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function hasFocus(pm) {
            if (document.activeElement != pm.content)
                return !1;
            var sel = window.getSelection();
            return sel.rangeCount && (0,
            _dom.contains)(pm.content, sel.anchorNode)
        }
        function findSelectionIn(node, pos, index, dir, text) {
            for (var i = index - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
                var child = node.child(i);
                if (child.isTextblock)
                    return new TextSelection(pos + dir);
                if (child.type.contains) {
                    var inner = findSelectionIn(child, pos + dir, 0 > dir ? child.childCount : 0, dir, text);
                    if (inner)
                        return inner
                } else if (!text && child.type.selectable)
                    return new NodeSelection(pos - (0 > dir ? child.nodeSize : 0),pos + (dir > 0 ? child.nodeSize : 0),child);
                pos += child.nodeSize * dir
            }
        }
        function findSelectionFrom(doc, pos, dir, text) {
            var $pos = doc.resolve(pos)
              , inner = $pos.parent.isTextblock ? new TextSelection(pos) : findSelectionIn($pos.parent, pos, $pos.index($pos.depth), dir, text);
            if (inner)
                return inner;
            for (var depth = $pos.depth - 1; depth >= 0; depth--) {
                var found = 0 > dir ? findSelectionIn($pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, text) : findSelectionIn($pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, text);
                if (found)
                    return found
            }
        }
        function findSelectionNear(doc, pos) {
            var bias = arguments.length <= 2 || void 0 === arguments[2] ? 1 : arguments[2]
              , text = arguments[3]
              , result = findSelectionFrom(doc, pos, bias, text) || findSelectionFrom(doc, pos, -bias, text);
            if (!result)
                throw new RangeError("Searching for selection in invalid document " + doc);
            return result
        }
        function findSelectionAtStart(node, text) {
            return findSelectionIn(node, 0, 0, 1, text)
        }
        function findSelectionAtEnd(node, text) {
            return findSelectionIn(node, node.content.size, node.childCount, -1, text)
        }
        function verticalMotionLeavesTextblock(pm, pos, dir) {
            for (var $pos = pm.doc.resolve(pos), dom = (0,
            _dompos.DOMAfterPos)(pm, $pos.before($pos.depth)), coords = (0,
            _dompos.coordsAtPos)(pm, pos), child = dom.firstChild; child; child = child.nextSibling)
                if (1 == child.nodeType)
                    for (var boxes = child.getClientRects(), i = 0; i < boxes.length; i++) {
                        var box = boxes[i];
                        if (0 > dir ? box.bottom < coords.top : box.top > coords.bottom)
                            return !1
                    }
            return !0
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.NodeSelection = exports.TextSelection = exports.Selection = exports.SelectionState = void 0,
        exports.hasFocus = hasFocus,
        exports.findSelectionFrom = findSelectionFrom,
        exports.findSelectionNear = findSelectionNear,
        exports.findSelectionAtStart = findSelectionAtStart,
        exports.findSelectionAtEnd = findSelectionAtEnd,
        exports.verticalMotionLeavesTextblock = verticalMotionLeavesTextblock;
        var _dom = require("../dom")
          , _dompos = require("./dompos")
          , Selection = (exports.SelectionState = function() {
            function SelectionState(pm, range) {
                var _this = this;
                _classCallCheck(this, SelectionState),
                this.pm = pm,
                this.range = range,
                this.polling = null,
                this.lastAnchorNode = this.lastHeadNode = this.lastAnchorOffset = this.lastHeadOffset = null,
                this.lastNode = null,
                pm.content.addEventListener("focus", function() {
                    return _this.receivedFocus()
                }),
                this.poller = this.poller.bind(this)
            }
            return _createClass(SelectionState, [{
                key: "setAndSignal",
                value: function(range, clearLast) {
                    this.set(range, clearLast),
                    this.pm.signal("selectionChange")
                }
            }, {
                key: "set",
                value: function(range, clearLast) {
                    this.pm.ensureOperation({
                        readSelection: !1
                    }),
                    this.range = range,
                    clearLast !== !1 && (this.lastAnchorNode = null)
                }
            }, {
                key: "poller",
                value: function() {
                    hasFocus(this.pm) ? (this.pm.operation || this.readFromDOM(),
                    this.polling = setTimeout(this.poller, 100)) : this.polling = null
                }
            }, {
                key: "startPolling",
                value: function() {
                    clearTimeout(this.polling),
                    this.polling = setTimeout(this.poller, 50)
                }
            }, {
                key: "fastPoll",
                value: function() {
                    this.startPolling()
                }
            }, {
                key: "stopPolling",
                value: function() {
                    clearTimeout(this.polling),
                    this.polling = null
                }
            }, {
                key: "domChanged",
                value: function() {
                    var sel = window.getSelection();
                    return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset || sel.focusNode != this.lastHeadNode || sel.focusOffset != this.lastHeadOffset
                }
            }, {
                key: "storeDOMState",
                value: function() {
                    var sel = window.getSelection();
                    this.lastAnchorNode = sel.anchorNode,
                    this.lastAnchorOffset = sel.anchorOffset,
                    this.lastHeadNode = sel.focusNode,
                    this.lastHeadOffset = sel.focusOffset
                }
            }, {
                key: "readFromDOM",
                value: function() {
                    if (!hasFocus(this.pm) || !this.domChanged())
                        return !1;
                    var sel = window.getSelection()
                      , doc = this.pm.doc
                      , anchor = (0,
                    _dompos.posFromDOM)(this.pm, sel.anchorNode, sel.anchorOffset)
                      , head = sel.isCollapsed ? anchor : (0,
                    _dompos.posFromDOM)(this.pm, sel.focusNode, sel.focusOffset)
                      , newRange = findSelectionNear(doc, head, null != this.range.head && this.range.head < head ? 1 : -1);
                    if (newRange instanceof TextSelection) {
                        var selNearAnchor = findSelectionNear(doc, anchor, anchor > newRange.to ? -1 : 1, !0);
                        newRange = new TextSelection(selNearAnchor.anchor,newRange.head)
                    } else if (anchor < newRange.from || anchor > newRange.to) {
                        var inv = anchor > newRange.to;
                        newRange = new TextSelection(findSelectionNear(doc, anchor, inv ? -1 : 1, !0).anchor,findSelectionNear(doc, inv ? newRange.from : newRange.to, inv ? 1 : -1, !0).head)
                    }
                    return this.setAndSignal(newRange),
                    newRange instanceof NodeSelection || newRange.head != head || newRange.anchor != anchor ? this.toDOM() : (this.clearNode(),
                    this.storeDOMState()),
                    !0
                }
            }, {
                key: "toDOM",
                value: function(takeFocus) {
                    if (!hasFocus(this.pm)) {
                        if (!takeFocus)
                            return;
                        _dom.browser.gecko && this.pm.content.focus()
                    }
                    this.range instanceof NodeSelection ? this.nodeToDOM() : this.rangeToDOM()
                }
            }, {
                key: "nodeToDOM",
                value: function() {
                    var dom = (0,
                    _dompos.DOMAfterPos)(this.pm, this.range.from);
                    dom != this.lastNode && (this.clearNode(),
                    dom.classList.add("ProseMirror-selectednode"),
                    this.pm.content.classList.add("ProseMirror-nodeselection"),
                    this.lastNode = dom);
                    var range = document.createRange()
                      , sel = window.getSelection();
                    range.selectNode(dom),
                    sel.removeAllRanges(),
                    sel.addRange(range),
                    this.storeDOMState()
                }
            }, {
                key: "rangeToDOM",
                value: function() {
                    this.clearNode();
                    var anchor = (0,
                    _dompos.DOMFromPos)(this.pm, this.range.anchor)
                      , head = (0,
                    _dompos.DOMFromPos)(this.pm, this.range.head)
                      , sel = window.getSelection()
                      , range = document.createRange();
                    if (sel.extend)
                        range.setEnd(anchor.node, anchor.offset),
                        range.collapse(!1);
                    else {
                        if (this.range.anchor > this.range.head) {
                            var tmp = anchor;
                            anchor = head,
                            head = tmp
                        }
                        range.setEnd(head.node, head.offset),
                        range.setStart(anchor.node, anchor.offset)
                    }
                    sel.removeAllRanges(),
                    sel.addRange(range),
                    sel.extend && sel.extend(head.node, head.offset),
                    this.storeDOMState()
                }
            }, {
                key: "clearNode",
                value: function() {
                    return this.lastNode ? (this.lastNode.classList.remove("ProseMirror-selectednode"),
                    this.pm.content.classList.remove("ProseMirror-nodeselection"),
                    this.lastNode = null,
                    !0) : void 0
                }
            }, {
                key: "receivedFocus",
                value: function() {
                    null == this.polling && this.startPolling()
                }
            }]),
            SelectionState
        }(),
        exports.Selection = function Selection() {
            _classCallCheck(this, Selection)
        }
        )
          , TextSelection = exports.TextSelection = function(_Selection) {
            function TextSelection(anchor, head) {
                _classCallCheck(this, TextSelection);
                var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(TextSelection).call(this));
                return _this2.anchor = anchor,
                _this2.head = null == head ? anchor : head,
                _this2
            }
            return _inherits(TextSelection, _Selection),
            _createClass(TextSelection, [{
                key: "eq",
                value: function(other) {
                    return other instanceof TextSelection && other.head == this.head && other.anchor == this.anchor
                }
            }, {
                key: "map",
                value: function(doc, mapping) {
                    var head = mapping.map(this.head);
                    if (!doc.resolve(head).parent.isTextblock)
                        return findSelectionNear(doc, head);
                    var anchor = mapping.map(this.anchor);
                    return new TextSelection(doc.resolve(anchor).parent.isTextblock ? anchor : head,head)
                }
            }, {
                key: "inverted",
                get: function() {
                    return this.anchor > this.head
                }
            }, {
                key: "from",
                get: function() {
                    return Math.min(this.head, this.anchor)
                }
            }, {
                key: "to",
                get: function() {
                    return Math.max(this.head, this.anchor)
                }
            }, {
                key: "empty",
                get: function() {
                    return this.anchor == this.head
                }
            }, {
                key: "token",
                get: function() {
                    return new SelectionToken(TextSelection,this.anchor,this.head)
                }
            }], [{
                key: "mapToken",
                value: function(token, mapping) {
                    return new SelectionToken(TextSelection,mapping.map(token.a),mapping.map(token.b))
                }
            }, {
                key: "fromToken",
                value: function(token, doc) {
                    return doc.resolve(token.b).parent.isTextblock ? new TextSelection(doc.resolve(token.a).parent.isTextblock ? token.a : token.b,token.b) : findSelectionNear(doc, token.b)
                }
            }]),
            TextSelection
        }(Selection)
          , NodeSelection = exports.NodeSelection = function(_Selection2) {
            function NodeSelection(from, to, node) {
                _classCallCheck(this, NodeSelection);
                var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(NodeSelection).call(this));
                return _this3.from = from,
                _this3.to = to,
                _this3.node = node,
                _this3
            }
            return _inherits(NodeSelection, _Selection2),
            _createClass(NodeSelection, [{
                key: "eq",
                value: function(other) {
                    return other instanceof NodeSelection && this.from == other.from
                }
            }, {
                key: "map",
                value: function(doc, mapping) {
                    var from = mapping.map(this.from, 1)
                      , to = mapping.map(this.to, -1)
                      , node = doc.nodeAt(from);
                    return node && to == from + node.nodeSize && node.type.selectable ? new NodeSelection(from,to,node) : findSelectionNear(doc, from)
                }
            }, {
                key: "empty",
                get: function() {
                    return !1
                }
            }, {
                key: "token",
                get: function() {
                    return new SelectionToken(NodeSelection,this.from,this.to)
                }
            }], [{
                key: "mapToken",
                value: function(token, mapping) {
                    return new SelectionToken(TextSelection,mapping.map(token.a, 1),mapping.map(token.b, -1))
                }
            }, {
                key: "fromToken",
                value: function(token, doc) {
                    var node = doc.nodeAt(token.a);
                    return node && token.b == token.a + node.nodeSize && node.type.selectable ? new NodeSelection(token.a,token.b,node) : findSelectionNear(doc, token.a)
                }
            }]),
            NodeSelection
        }(Selection)
          , SelectionToken = function SelectionToken(type, a, b) {
            _classCallCheck(this, SelectionToken),
            this.type = type,
            this.a = a,
            this.b = b
        }
    }
    , {
        "../dom": 1,
        "./dompos": 8
    }],
    18: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.EditorTransform = void 0;
        var _transform = require("../transform");
        exports.EditorTransform = function(_Transform) {
            function EditorTransform(pm) {
                _classCallCheck(this, EditorTransform);
                var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EditorTransform).call(this, pm.doc));
                return _this.pm = pm,
                _this
            }
            return _inherits(EditorTransform, _Transform),
            _createClass(EditorTransform, [{
                key: "apply",
                value: function(options) {
                    return this.pm.apply(this, options)
                }
            }, {
                key: "replaceSelection",
                value: function(node, inheritMarks) {
                    var _selection = this.selection
                      , empty = _selection.empty
                      , from = _selection.from
                      , to = _selection.to
                      , selNode = _selection.node;
                    if (node && node.isInline && inheritMarks !== !1 && (node = node.mark(empty ? this.pm.input.storedMarks : this.doc.marksAt(from))),
                    selNode && selNode.isTextblock && node && node.isInline)
                        from++,
                        to--;
                    else if (selNode) {
                        for (var $from = this.doc.resolve(from), depth = $from.depth; depth && 1 == $from.node(depth).childCount && !(node ? $from.node(depth).type.canContain(node) : $from.node(depth).type.canBeEmpty); )
                            depth--;
                        depth < $from.depth && (from = $from.before(depth + 1),
                        to = $from.after(depth + 1))
                    } else if (node && node.isBlock) {
                        var $from = this.doc.resolve(from);
                        if ($from.depth && $from.node($from.depth - 1).type.canContain(node))
                            return this["delete"](from, to),
                            $from.parentOffset && $from.parentOffset < $from.parent.content.size && this.split(from),
                            this.insert(from + ($from.parentOffset ? 1 : -1), node)
                    }
                    return this.replaceWith(from, to, node)
                }
            }, {
                key: "deleteSelection",
                value: function() {
                    return this.replaceSelection()
                }
            }, {
                key: "typeText",
                value: function(text) {
                    return this.replaceSelection(this.pm.schema.text(text), !0)
                }
            }, {
                key: "selection",
                get: function() {
                    return this.steps.length ? this.pm.selection.map(this) : this.pm.selection
                }
            }]),
            EditorTransform
        }(_transform.Transform)
    }
    , {
        "../transform": 41
    }],
    19: [function(require, module, exports) {
        "use strict";
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            }
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function fromDOM(schema, dom, options) {
            options || (options = {});
            var context = new DOMParseState(schema,options.topNode || schema.node("doc"),options)
              , start = options.from ? dom.childNodes[options.from] : dom.firstChild
              , end = null != options.to && dom.childNodes[options.to] || null;
            context.addAll(start, end, !0);
            var doc = void 0;
            do
                doc = context.leave();
            while (context.stack.length);return doc
        }
        function fromHTML(schema, html, options) {
            var wrap = (options && options.document || window.document).createElement("div");
            return wrap.innerHTML = html,
            fromDOM(schema, wrap, options)
        }
        function matches(dom, selector) {
            return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector)
        }
        function parseStyles(style) {
            for (var re = /\s*([\w-]+)\s*:\s*([^;]+)/g, m = void 0, result = []; m = re.exec(style); )
                result.push(m[1], m[2].trim());
            return result
        }
        function schemaInfo(schema) {
            return schema.cached.parseDOMInfo || (schema.cached.parseDOMInfo = summarizeSchemaInfo(schema))
        }
        function summarizeSchemaInfo(schema) {
            var tags = Object.create(null)
              , styles = Object.create(null);
            return tags._ = [],
            schema.registry("parseDOM", function(tag, info, type) {
                var parse = info.parse;
                "block" == parse ? parse = function(dom, state) {
                    state.wrapIn(dom, this)
                }
                : "mark" == parse && (parse = function(dom, state) {
                    state.wrapMark(dom, this)
                }
                ),
                (0,
                _sortedinsert2["default"])(tags[tag] || (tags[tag] = []), {
                    type: type,
                    parse: parse,
                    selector: info.selector,
                    rank: null == info.rank ? 50 : info.rank
                }, function(a, b) {
                    return a.rank - b.rank
                })
            }),
            schema.registry("parseDOMStyle", function(style, info, type) {
                (0,
                _sortedinsert2["default"])(styles[style] || (styles[style] = []), {
                    type: type,
                    parse: info.parse,
                    rank: null == info.rank ? 50 : info.rank
                }, function(a, b) {
                    return a.rank - b.rank
                })
            }),
            {
                tags: tags,
                styles: styles
            }
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.fromDOM = fromDOM,
        exports.fromHTML = fromHTML;
        var _model = require("../model")
          , _sortedinsert = require("../util/sortedinsert")
          , _sortedinsert2 = _interopRequireDefault(_sortedinsert)
          , _register = require("./register");
        (0,
        _register.defineSource)("dom", fromDOM),
        (0,
        _register.defineSource)("html", fromHTML);
        var blockElements = {
            address: !0,
            article: !0,
            aside: !0,
            blockquote: !0,
            canvas: !0,
            dd: !0,
            div: !0,
            dl: !0,
            fieldset: !0,
            figcaption: !0,
            figure: !0,
            footer: !0,
            form: !0,
            h1: !0,
            h2: !0,
            h3: !0,
            h4: !0,
            h5: !0,
            h6: !0,
            header: !0,
            hgroup: !0,
            hr: !0,
            li: !0,
            noscript: !0,
            ol: !0,
            output: !0,
            p: !0,
            pre: !0,
            section: !0,
            table: !0,
            tfoot: !0,
            ul: !0
        }
          , ignoreElements = {
            head: !0,
            noscript: !0,
            object: !0,
            script: !0,
            style: !0,
            title: !0
        }
          , listElements = {
            ol: !0,
            ul: !0
        }
          , noMarks = []
          , DOMParseState = function() {
            function DOMParseState(schema, topNode, options) {
                _classCallCheck(this, DOMParseState),
                this.options = options || {},
                this.schema = schema,
                this.stack = [],
                this.marks = noMarks,
                this.closing = !1,
                this.enter(topNode.type, topNode.attrs);
                var info = schemaInfo(schema);
                this.tagInfo = info.tags,
                this.styleInfo = info.styles
            }
            return _createClass(DOMParseState, [{
                key: "addDOM",
                value: function(dom) {
                    if (3 == dom.nodeType) {
                        var value = dom.nodeValue
                          , top = this.top
                          , last = void 0;
                        (/\S/.test(value) || top.type.isTextblock) && (this.options.preserveWhitespace || (value = value.replace(/\s+/g, " "),
                        /^\s/.test(value) && (!(last = top.content[top.content.length - 1]) || "text" == last.type.name && /\s$/.test(last.text)) && (value = value.slice(1))),
                        value && this.insertNode(this.schema.text(value, this.marks)))
                    } else if (1 == dom.nodeType && !dom.hasAttribute("pm-ignore")) {
                        var style = dom.getAttribute("style");
                        style ? this.addElementWithStyles(parseStyles(style), dom) : this.addElement(dom)
                    }
                }
            }, {
                key: "addElement",
                value: function(dom) {
                    var name = dom.nodeName.toLowerCase();
                    listElements.hasOwnProperty(name) && this.normalizeList(dom),
                    (!this.options.editableContent || "br" != name || dom.nextSibling) && (this.parseNodeType(name, dom) || ignoreElements.hasOwnProperty(name) || (this.addAll(dom.firstChild, null),
                    blockElements.hasOwnProperty(name) && this.top.type == this.schema.defaultTextblockType() && (this.closing = !0)))
                }
            }, {
                key: "addElementWithStyles",
                value: function(styles, dom) {
                    for (var _this = this, wrappers = [], i = 0; i < styles.length; i += 2) {
                        var parsers = this.styleInfo[styles[i]]
                          , value = styles[i + 1];
                        if (parsers)
                            for (var j = 0; j < parsers.length; j++)
                                wrappers.push(parsers[j], value)
                    }
                    var next = function next(i) {
                        if (i == wrappers.length)
                            _this.addElement(dom);
                        else {
                            var parser = wrappers[i];
                            parser.parse.call(parser.type, wrappers[i + 1], _this, next.bind(null, i + 2))
                        }
                    };
                    next(0)
                }
            }, {
                key: "tryParsers",
                value: function(parsers, dom) {
                    if (parsers)
                        for (var i = 0; i < parsers.length; i++) {
                            var parser = parsers[i];
                            if ((!parser.selector || matches(dom, parser.selector)) && parser.parse.call(parser.type, dom, this) !== !1)
                                return !0
                        }
                }
            }, {
                key: "parseNodeType",
                value: function(name, dom) {
                    return this.tryParsers(this.tagInfo[name], dom) || this.tryParsers(this.tagInfo._, dom)
                }
            }, {
                key: "addAll",
                value: function(from, to, sync) {
                    for (var stack = sync && this.stack.slice(), dom = from; dom != to; dom = dom.nextSibling)
                        this.addDOM(dom),
                        sync && blockElements.hasOwnProperty(dom.nodeName.toLowerCase()) && this.sync(stack)
                }
            }, {
                key: "doClose",
                value: function() {
                    if (this.closing && !(this.stack.length < 2)) {
                        var left = this.leave();
                        this.enter(left.type, left.attrs),
                        this.closing = !1
                    }
                }
            }, {
                key: "insertNode",
                value: function(node) {
                    if (this.top.type.canContain(node))
                        this.doClose();
                    else {
                        for (var found = void 0, i = this.stack.length - 1; i >= 0; i--) {
                            var route = this.stack[i].type.findConnection(node.type);
                            if (route) {
                                if (i == this.stack.length - 1)
                                    this.doClose();
                                else
                                    for (; this.stack.length > i + 1; )
                                        this.leave();
                                found = route;
                                break
                            }
                        }
                        if (!found)
                            return;
                        for (var j = 0; j < found.length; j++)
                            this.enter(found[j]);
                        this.marks.length && (this.marks = noMarks)
                    }
                    return this.top.content.push(node),
                    node
                }
            }, {
                key: "close",
                value: function(type, attrs, content) {
                    return content = _model.Fragment.from(content),
                    type.checkContent(content, attrs) || (content = type.fixContent(content, attrs)) ? type.create(attrs, content, this.marks) : null
                }
            }, {
                key: "insert",
                value: function(type, attrs, content) {
                    var closed = this.close(type, attrs, content);
                    return closed ? this.insertNode(closed) : void 0
                }
            }, {
                key: "enter",
                value: function(type, attrs) {
                    this.stack.push({
                        type: type,
                        attrs: attrs,
                        content: []
                    })
                }
            }, {
                key: "leave",
                value: function() {
                    this.marks.length && (this.marks = noMarks);
                    var top = this.stack.pop()
                      , last = top.content[top.content.length - 1];
                    !this.options.preserveWhitespace && last && last.isText && /\s$/.test(last.text) && (1 == last.text.length ? top.content.pop() : top.content[top.content.length - 1] = last.copy(last.text.slice(0, last.text.length - 1)));
                    var node = this.close(top.type, top.attrs, top.content);
                    return node && this.stack.length && this.insertNode(node),
                    node
                }
            }, {
                key: "sync",
                value: function(stack) {
                    for (; this.stack.length > stack.length; )
                        this.leave();
                    for (; ; ) {
                        var n = this.stack.length - 1
                          , one = this.stack[n]
                          , two = stack[n];
                        if (one.type == two.type && _model.Node.sameAttrs(one.attrs, two.attrs))
                            break;
                        this.leave()
                    }
                    for (; stack.length > this.stack.length; ) {
                        var add = stack[this.stack.length];
                        this.enter(add.type, add.attrs)
                    }
                    this.marks.length && (this.marks = noMarks),
                    this.closing = !1
                }
            }, {
                key: "wrapIn",
                value: function(dom, type, attrs) {
                    this.enter(type, attrs),
                    this.addAll(dom.firstChild, null, !0),
                    this.leave()
                }
            }, {
                key: "wrapMark",
                value: function(inner, mark) {
                    var old = this.marks;
                    this.marks = (mark.instance || mark).addToSet(old),
                    inner.call ? inner() : this.addAll(inner.firstChild, null),
                    this.marks = old
                }
            }, {
                key: "normalizeList",
                value: function(dom) {
                    for (var prev, child = dom.firstChild; child; child = child.nextSibling)
                        1 == child.nodeType && listElements.hasOwnProperty(child.nodeName.toLowerCase()) && (prev = child.previousSibling) && (prev.appendChild(child),
                        child = prev)
                }
            }, {
                key: "top",
                get: function() {
                    return this.stack[this.stack.length - 1]
                }
            }]),
            DOMParseState
        }();
        _model.Paragraph.register("parseDOM", "p", {
            parse: "block"
        }),
        _model.BlockQuote.register("parseDOM", "blockquote", {
            parse: "block"
        });
        for (var _loop = function(i) {
            _model.Heading.registerComputed("parseDOM", "h" + i, function(type) {
                return i <= type.maxLevel ? {
                    parse: function(dom, state) {
                        state.wrapIn(dom, this, {
                            level: String(i)
                        })
                    }
                } : void 0
            })
        }, i = 1; 6 >= i; i++)
            _loop(i);
        _model.HorizontalRule.register("parseDOM", "hr", {
            parse: "block"
        }),
        _model.CodeBlock.register("parseDOM", "pre", {
            parse: function(dom, state) {
                var params = dom.firstChild && /^code$/i.test(dom.firstChild.nodeName) && dom.firstChild.getAttribute("class");
                if (params && /fence/.test(params)) {
                    for (var found = [], re = /(?:^|\s)lang-(\S+)/g, m = void 0; m = re.exec(params); )
                        found.push(m[1]);
                    params = found.join(" ")
                } else
                    params = null;
                var text = dom.textContent;
                state.insert(this, {
                    params: params
                }, text ? [state.schema.text(text)] : [])
            }
        }),
        _model.BulletList.register("parseDOM", "ul", {
            parse: "block"
        }),
        _model.OrderedList.register("parseDOM", "ol", {
            parse: function(dom, state) {
                var attrs = {
                    order: dom.getAttribute("start") || "1"
                };
                state.wrapIn(dom, this, attrs)
            }
        }),
        _model.ListItem.register("parseDOM", "li", {
            parse: "block"
        }),
        _model.HardBreak.register("parseDOM", "br", {
            parse: function(_, state) {
                state.insert(this)
            }
        }),
        _model.Image.register("parseDOM", "img", {
            parse: function(dom, state) {
                state.insert(this, {
                    src: dom.getAttribute("src"),
                    title: dom.getAttribute("title") || null,
                    alt: dom.getAttribute("alt") || null
                })
            }
        }),
        _model.LinkMark.register("parseDOM", "a", {
            parse: function(dom, state) {
                state.wrapMark(dom, this.create({
                    href: dom.getAttribute("href"),
                    title: dom.getAttribute("title")
                }))
            },
            selector: "[href]"
        }),
        _model.EmMark.register("parseDOM", "i", {
            parse: "mark"
        }),
        _model.EmMark.register("parseDOM", "em", {
            parse: "mark"
        }),
        _model.EmMark.register("parseDOMStyle", "font-style", {
            parse: function(value, state, inner) {
                "italic" == value ? state.wrapMark(inner, this) : inner()
            }
        }),
        _model.StrongMark.register("parseDOM", "b", {
            parse: "mark"
        }),
        _model.StrongMark.register("parseDOM", "strong", {
            parse: "mark"
        }),
        _model.StrongMark.register("parseDOMStyle", "font-weight", {
            parse: function(value, state, inner) {
                "bold" == value || "bolder" == value || !/\D/.test(value) && +value >= 500 ? state.wrapMark(inner, this) : inner()
            }
        }),
        _model.CodeMark.register("parseDOM", "code", {
            parse: "mark"
        })
    }
    , {
        "../model": 34,
        "../util/sortedinsert": 56,
        "./register": 22
    }],
    20: [function(require, module, exports) {
        "use strict";
        function fromText(schema, text) {
            for (var blocks = text.trim().split(/\n{2,}/), nodes = [], i = 0; i < blocks.length; i++) {
                for (var spans = [], parts = blocks[i].split("\n"), j = 0; j < parts.length; j++)
                    j && spans.push(schema.node("hard_break")),
                    parts[j] && spans.push(schema.text(parts[j]));
                nodes.push(schema.node("paragraph", null, spans))
            }
            return nodes.length || nodes.push(schema.node("paragraph")),
            schema.node("doc", null, nodes)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.fromText = fromText;
        var _register = require("./register");
        (0,
        _register.defineSource)("text", fromText)
    }
    , {
        "./register": 22
    }],
    21: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var _register = require("./register");
        Object.defineProperty(exports, "serializeTo", {
            enumerable: !0,
            get: function() {
                return _register.serializeTo
            }
        }),
        Object.defineProperty(exports, "knownTarget", {
            enumerable: !0,
            get: function() {
                return _register.knownTarget
            }
        }),
        Object.defineProperty(exports, "defineTarget", {
            enumerable: !0,
            get: function() {
                return _register.defineTarget
            }
        }),
        Object.defineProperty(exports, "parseFrom", {
            enumerable: !0,
            get: function() {
                return _register.parseFrom
            }
        }),
        Object.defineProperty(exports, "knownSource", {
            enumerable: !0,
            get: function() {
                return _register.knownSource
            }
        }),
        Object.defineProperty(exports, "defineSource", {
            enumerable: !0,
            get: function() {
                return _register.defineSource
            }
        });
        var _from_dom = require("./from_dom");
        Object.defineProperty(exports, "fromDOM", {
            enumerable: !0,
            get: function() {
                return _from_dom.fromDOM
            }
        }),
        Object.defineProperty(exports, "fromHTML", {
            enumerable: !0,
            get: function() {
                return _from_dom.fromHTML
            }
        });
        var _to_dom = require("./to_dom");
        Object.defineProperty(exports, "toDOM", {
            enumerable: !0,
            get: function() {
                return _to_dom.toDOM
            }
        }),
        Object.defineProperty(exports, "toHTML", {
            enumerable: !0,
            get: function() {
                return _to_dom.toHTML
            }
        }),
        Object.defineProperty(exports, "nodeToDOM", {
            enumerable: !0,
            get: function() {
                return _to_dom.nodeToDOM
            }
        });
        var _from_text = require("./from_text");
        Object.defineProperty(exports, "fromText", {
            enumerable: !0,
            get: function() {
                return _from_text.fromText
            }
        });
        var _to_text = require("./to_text");
        Object.defineProperty(exports, "toText", {
            enumerable: !0,
            get: function() {
                return _to_text.toText
            }
        })
    }
    , {
        "./from_dom": 19,
        "./from_text": 20,
        "./register": 22,
        "./to_dom": 23,
        "./to_text": 24
    }],
    22: [function(require, module, exports) {
        "use strict";
        function serializeTo(doc, format, options) {
            var converter = serializers[format];
            if (!converter)
                throw new RangeError("Target format " + format + " not defined");
            return converter(doc, options)
        }
        function knownTarget(format) {
            return !!serializers[format]
        }
        function defineTarget(format, func) {
            serializers[format] = func
        }
        function parseFrom(schema, value, format, options) {
            var converter = parsers[format];
            if (!converter)
                throw new RangeError("Source format " + format + " not defined");
            return converter(schema, value, options)
        }
        function knownSource(format) {
            return !!parsers[format]
        }
        function defineSource(format, func) {
            parsers[format] = func
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.serializeTo = serializeTo,
        exports.knownTarget = knownTarget,
        exports.defineTarget = defineTarget,
        exports.parseFrom = parseFrom,
        exports.knownSource = knownSource,
        exports.defineSource = defineSource;
        var serializers = Object.create(null);
        defineTarget("json", function(doc) {
            return doc.toJSON()
        });
        var parsers = Object.create(null);
        defineSource("json", function(schema, json) {
            return schema.nodeFromJSON(json)
        })
    }
    , {}],
    23: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function toDOM(content, options) {
            return new DOMSerializer(options).renderFragment(content instanceof _model.Node ? content.content : content)
        }
        function nodeToDOM(node, options, offset) {
            var serializer = new DOMSerializer(options)
              , dom = serializer.renderNode(node, offset);
            return node.isInline && (dom = serializer.wrapInlineFlat(dom, node.marks),
            serializer.options.renderInlineFlat && (dom = options.renderInlineFlat(node, dom, offset) || dom)),
            dom
        }
        function toHTML(content, options) {
            var serializer = new DOMSerializer(options)
              , wrap = serializer.elt("div");
            return wrap.appendChild(serializer.renderFragment(content instanceof _model.Node ? content.content : content)),
            wrap.innerHTML
        }
        function def(cls, method) {
            cls.prototype.serializeDOM = method
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.toDOM = toDOM,
        exports.nodeToDOM = nodeToDOM,
        exports.toHTML = toHTML;
        var _model = require("../model")
          , _register = require("./register")
          , DOMSerializer = function() {
            function DOMSerializer(options) {
                _classCallCheck(this, DOMSerializer),
                this.options = options || {},
                this.doc = this.options.document || window.document
            }
            return _createClass(DOMSerializer, [{
                key: "elt",
                value: function(type, attrs) {
                    var result = this.doc.createElement(type);
                    if (attrs)
                        for (var name in attrs)
                            "style" == name ? result.style.cssText = attrs[name] : attrs[name] && result.setAttribute(name, attrs[name]);
                    for (var _len = arguments.length, content = Array(_len > 2 ? _len - 2 : 0), _key = 2; _len > _key; _key++)
                        content[_key - 2] = arguments[_key];
                    for (var i = 0; i < content.length; i++)
                        result.appendChild("string" == typeof content[i] ? this.doc.createTextNode(content[i]) : content[i]);
                    return result
                }
            }, {
                key: "renderNode",
                value: function(node, offset) {
                    var dom = node.type.serializeDOM(node, this);
                    return this.options.onRender && (dom = this.options.onRender(node, dom, offset) || dom),
                    dom
                }
            }, {
                key: "renderFragment",
                value: function(fragment, where) {
                    return where || (where = this.doc.createDocumentFragment()),
                    0 == fragment.size ? where : (fragment.firstChild.isInline ? this.options.renderInlineFlat ? this.renderInlineFlatInto(fragment, where) : this.renderInlineInto(fragment, where) : this.renderBlocksInto(fragment, where),
                    where)
                }
            }, {
                key: "renderBlocksInto",
                value: function(fragment, where) {
                    var _this = this;
                    fragment.forEach(function(node, offset) {
                        return where.appendChild(_this.renderNode(node, offset))
                    })
                }
            }, {
                key: "renderInlineInto",
                value: function(fragment, where) {
                    var _this2 = this
                      , top = where
                      , active = [];
                    fragment.forEach(function(node, offset) {
                        for (var keep = 0; keep < Math.min(active.length, node.marks.length) && node.marks[keep].eq(active[keep]); ++keep)
                            ;
                        for (; keep < active.length; )
                            active.pop(),
                            top = top.parentNode;
                        for (; active.length < node.marks.length; ) {
                            var add = node.marks[active.length];
                            active.push(add),
                            top = top.appendChild(_this2.renderMark(add))
                        }
                        top.appendChild(_this2.renderNode(node, offset))
                    })
                }
            }, {
                key: "renderInlineFlatInto",
                value: function(fragment, where) {
                    var _this3 = this;
                    fragment.forEach(function(node, offset) {
                        var dom = _this3.renderNode(node, offset);
                        dom = _this3.wrapInlineFlat(dom, node.marks),
                        dom = _this3.options.renderInlineFlat(node, dom, offset) || dom,
                        where.appendChild(dom)
                    })
                }
            }, {
                key: "renderMark",
                value: function(mark) {
                    return mark.type.serializeDOM(mark, this)
                }
            }, {
                key: "wrapInlineFlat",
                value: function(dom, marks) {
                    for (var i = marks.length - 1; i >= 0; i--) {
                        var wrap = this.renderMark(marks[i]);
                        wrap.appendChild(dom),
                        dom = wrap
                    }
                    return dom
                }
            }, {
                key: "renderAs",
                value: function(node, tagName, tagAttrs) {
                    this.options.preRenderContent && this.options.preRenderContent(node);
                    var dom = this.renderFragment(node.content, this.elt(tagName, tagAttrs));
                    return this.options.onContainer && this.options.onContainer(dom),
                    this.options.postRenderContent && this.options.postRenderContent(node),
                    dom
                }
            }]),
            DOMSerializer
        }();
        (0,
        _register.defineTarget)("dom", toDOM),
        (0,
        _register.defineTarget)("html", toHTML),
        def(_model.BlockQuote, function(node, s) {
            return s.renderAs(node, "blockquote")
        }),
        _model.BlockQuote.prototype.countCoordsAsChild = function(_, pos, dom, coords) {
            var childBox = dom.firstChild.getBoundingClientRect();
            return coords.left < childBox.left - 2 ? pos : void 0
        }
        ,
        def(_model.BulletList, function(node, s) {
            return s.renderAs(node, "ul")
        }),
        def(_model.OrderedList, function(node, s) {
            return s.renderAs(node, "ol", {
                start: "1" != node.attrs.order && node.attrs.order
            })
        }),
        _model.OrderedList.prototype.countCoordsAsChild = _model.BulletList.prototype.countCoordsAsChild = function(_, pos, dom, coords) {
            for (var child = dom.firstChild; child; child = child.nextSibling) {
                var off = child.getAttribute("pm-offset");
                if (off) {
                    var childBox = child.getBoundingClientRect();
                    if (coords.left > childBox.left - 2)
                        return null;
                    if (childBox.top <= coords.top && childBox.bottom >= coords.top)
                        return pos + 1 + +off
                }
            }
        }
        ,
        def(_model.ListItem, function(node, s) {
            return s.renderAs(node, "li")
        }),
        def(_model.HorizontalRule, function(_, s) {
            return s.elt("div", null, s.elt("hr"))
        }),
        def(_model.Paragraph, function(node, s) {
            return s.renderAs(node, "p")
        }),
        def(_model.Heading, function(node, s) {
            return s.renderAs(node, "h" + node.attrs.level)
        }),
        def(_model.CodeBlock, function(node, s) {
            var code = s.renderAs(node, "code");
            return null != node.attrs.params && (code.className = "fence " + node.attrs.params.replace(/(^|\s+)/g, "$&lang-")),
            s.elt("pre", null, code)
        }),
        def(_model.Text, function(node, s) {
            return s.doc.createTextNode(node.text)
        }),
        def(_model.Image, function(node, s) {
            return s.elt("img", {
                src: node.attrs.src,
                alt: node.attrs.alt,
                title: node.attrs.title
            })
        }),
        def(_model.HardBreak, function(_, s) {
            return s.elt("br")
        }),
        def(_model.EmMark, function(_, s) {
            return s.elt("em")
        }),
        def(_model.StrongMark, function(_, s) {
            return s.elt("strong")
        }),
        def(_model.CodeMark, function(_, s) {
            return s.elt("code")
        }),
        def(_model.LinkMark, function(mark, s) {
            return s.elt("a", {
                href: mark.attrs.href,
                title: mark.attrs.title
            })
        })
    }
    , {
        "../model": 34,
        "./register": 22
    }],
    24: [function(require, module, exports) {
        "use strict";
        function serializeFragment(fragment) {
            var accum = "";
            return fragment.forEach(function(child) {
                return accum += child.type.serializeText(child)
            }),
            accum
        }
        function toText(content) {
            return serializeFragment(content).trim()
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.toText = toText;
        var _model = require("../model")
          , _register = require("./register");
        _model.Block.prototype.serializeText = function(node) {
            return serializeFragment(node.content)
        }
        ,
        _model.Textblock.prototype.serializeText = function(node) {
            var text = _model.Block.prototype.serializeText(node);
            return text && text + "\n\n"
        }
        ,
        _model.Inline.prototype.serializeText = function() {
            return ""
        }
        ,
        _model.HardBreak.prototype.serializeText = function() {
            return "\n"
        }
        ,
        _model.Text.prototype.serializeText = function(node) {
            return node.text
        }
        ,
        (0,
        _register.defineTarget)("text", toText)
    }
    , {
        "../model": 34,
        "./register": 22
    }],
    25: [function(require, module, exports) {
        "use strict";
        function wrapAndJoin(pm, pos, type) {
            var attrs = arguments.length <= 3 || void 0 === arguments[3] ? null : arguments[3]
              , predicate = arguments.length <= 4 || void 0 === arguments[4] ? null : arguments[4]
              , $pos = pm.doc.resolve(pos)
              , d1 = $pos.depth - 1
              , sibling = $pos.index(d1) > 0 && $pos.node(d1).child($pos.index(d1) - 1)
              , join = sibling && sibling.type == type && (!predicate || predicate(sibling))
              , start = pos - $pos.parentOffset
              , tr = pm.tr["delete"](start, pos).wrap(start, start, type, attrs);
            join && tr.join($pos.before($pos.depth)),
            tr.apply()
        }
        function setAs(pm, pos, type, attrs) {
            var $pos = pm.doc.resolve(pos)
              , start = pos - $pos.parentOffset;
            pm.tr["delete"](start, pos).setBlockType(start, start, type, attrs).apply()
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.autoInputRules = void 0;
        var _model = require("../model")
          , _edit = require("../edit")
          , _inputrules = require("./inputrules")
          , autoInputRules = exports.autoInputRules = Object.create(null);
        (0,
        _edit.defineOption)("autoInput", !1, function(pm, val) {
            pm.mod.autoInput && (pm.mod.autoInput.forEach(function(rule) {
                return (0,
                _inputrules.removeInputRule)(pm, rule)
            }),
            pm.mod.autoInput = null),
            val && !function() {
                val === !0 && (val = ["schema", autoInputRules]);
                var rules = Object.create(null)
                  , list = pm.mod.autoInput = [];
                val.forEach(function(spec) {
                    if ("schema" === spec)
                        pm.schema.registry("autoInput", function(name, rule, type, typeName) {
                            var rname = typeName + ":" + name
                              , handler = rule.handler;
                            handler.bind && (handler = handler.bind(type)),
                            rules[rname] = new _inputrules.InputRule(rule.match,rule.filter,handler)
                        });
                    else
                        for (var name in spec) {
                            var _val = spec[name];
                            null == _val ? delete rules[name] : rules[name] = _val
                        }
                });
                for (var name in rules)
                    (0,
                    _inputrules.addInputRule)(pm, rules[name]),
                    list.push(rules[name])
            }()
        }),
        autoInputRules.emDash = new _inputrules.InputRule(/--$/,"-","—"),
        autoInputRules.openDoubleQuote = new _inputrules.InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/,'"',"“"),
        autoInputRules.closeDoubleQuote = new _inputrules.InputRule(/"$/,'"',"”"),
        autoInputRules.openSingleQuote = new _inputrules.InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/,"'","‘"),
        autoInputRules.closeSingleQuote = new _inputrules.InputRule(/'$/,"'","’"),
        _model.BlockQuote.register("autoInput", "startBlockQuote", new _inputrules.InputRule(/^\s*> $/," ",function(pm, _, pos) {
            wrapAndJoin(pm, pos, this)
        }
        )),
        _model.OrderedList.register("autoInput", "startOrderedList", new _inputrules.InputRule(/^(\d+)\. $/," ",function(pm, match, pos) {
            var order = +match[1];
            wrapAndJoin(pm, pos, this, {
                order: order || null
            }, function(node) {
                return node.childCount + +node.attrs.order == order
            })
        }
        )),
        _model.BulletList.register("autoInput", "startBulletList", new _inputrules.InputRule(/^\s*([-+*]) $/," ",function(pm, match, pos) {
            var bullet = match[1];
            wrapAndJoin(pm, pos, this, null, function(node) {
                return node.attrs.bullet == bullet
            })
        }
        )),
        _model.CodeBlock.register("autoInput", "startCodeBlock", new _inputrules.InputRule(/^```$/,"`",function(pm, _, pos) {
            setAs(pm, pos, this, {
                params: ""
            })
        }
        )),
        _model.Heading.registerComputed("autoInput", "startHeading", function(type) {
            var re = new RegExp("^(#{1," + type.maxLevel + "}) $");
            return new _inputrules.InputRule(re," ",function(pm, match, pos) {
                setAs(pm, pos, this, {
                    level: match[1].length
                })
            }
            )
        })
    }
    , {
        "../edit": 11,
        "../model": 34,
        "./inputrules": 26
    }],
    26: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function addInputRule(pm, rule) {
            pm.mod.interpretInput || (pm.mod.interpretInput = new InputRules(pm)),
            pm.mod.interpretInput.addRule(rule)
        }
        function removeInputRule(pm, rule) {
            var ii = pm.mod.interpretInput;
            ii && (ii.removeRule(rule),
            0 == ii.rules.length && (ii.unregister(),
            pm.mod.interpretInput = null))
        }
        function getContext($pos) {
            for (var parent = $pos.parent, isCode = parent.type.isCode, textBefore = "", i = 0, rem = $pos.parentOffset; rem > 0; i++) {
                var child = parent.child(i);
                textBefore += child.isText ? child.text.slice(0, rem) : "￼",
                rem -= child.nodeSize,
                0 >= rem && child.marks.some(function(st) {
                    return st.type.isCode
                }) && (isCode = !0)
            }
            return {
                textBefore: textBefore,
                isCode: isCode
            }
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.InputRule = void 0,
        exports.addInputRule = addInputRule,
        exports.removeInputRule = removeInputRule;
        var _edit = require("../edit")
          , InputRules = (exports.InputRule = function InputRule(match, filter, handler) {
            _classCallCheck(this, InputRule),
            this.filter = filter,
            this.match = match,
            this.handler = handler
        }
        ,
        function() {
            function InputRules(pm) {
                var _this = this;
                _classCallCheck(this, InputRules),
                this.pm = pm,
                this.rules = [],
                this.cancelVersion = null,
                pm.on("selectionChange", this.onSelChange = function() {
                    return _this.cancelVersion = null
                }
                ),
                pm.on("textInput", this.onTextInput = this.onTextInput.bind(this)),
                pm.addKeymap(new _edit.Keymap({
                    Backspace: function(pm) {
                        return _this.backspace(pm)
                    }
                },{
                    name: "inputRules"
                }), 20)
            }
            return _createClass(InputRules, [{
                key: "unregister",
                value: function() {
                    this.pm.off("selectionChange", this.onSelChange),
                    this.pm.off("textInput", this.onTextInput),
                    this.pm.removeKeymap("inputRules")
                }
            }, {
                key: "addRule",
                value: function(rule) {
                    this.rules.push(rule)
                }
            }, {
                key: "removeRule",
                value: function(rule) {
                    var found = this.rules.indexOf(rule);
                    return found > -1 ? (this.rules.splice(found, 1),
                    !0) : void 0
                }
            }, {
                key: "onTextInput",
                value: function(text) {
                    var pos = this.pm.selection.head;
                    if (pos)
                        for (var textBefore = void 0, isCode = void 0, $pos = void 0, lastCh = text[text.length - 1], i = 0; i < this.rules.length; i++) {
                            var rule = this.rules[i]
                              , match = void 0;
                            if (!rule.filter || rule.filter == lastCh) {
                                if (!$pos) {
                                    $pos = this.pm.doc.resolve(pos);
                                    var _getContext = getContext($pos);
                                    if (textBefore = _getContext.textBefore,
                                    isCode = _getContext.isCode)
                                        return
                                }
                                if (match = rule.match.exec(textBefore)) {
                                    var startVersion = this.pm.history.getVersion();
                                    if ("string" == typeof rule.handler) {
                                        var start = pos - (match[1] || match[0]).length
                                          , marks = this.pm.doc.marksAt(pos);
                                        this.pm.tr["delete"](start, pos).insert(start, this.pm.schema.text(rule.handler, marks)).apply()
                                    } else
                                        rule.handler(this.pm, match, pos);
                                    return void (this.cancelVersion = startVersion)
                                }
                            }
                        }
                }
            }, {
                key: "backspace",
                value: function() {
                    return this.cancelVersion ? (this.pm.history.backToVersion(this.cancelVersion),
                    void (this.cancelVersion = null)) : !1
                }
            }]),
            InputRules
        }())
    }
    , {
        "../edit": 11
    }],
    27: [function(require, module, exports) {
        "use strict";
        function getIcon(name, data) {
            var node = document.createElement("div");
            if (node.className = prefix,
            data.path) {
                svgBuilt[name] || buildSVG(name, data);
                var svg = node.appendChild(document.createElementNS(SVG, "svg"));
                svg.style.width = data.width / data.height + "em";
                var use = svg.appendChild(document.createElementNS(SVG, "use"));
                use.setAttributeNS(XLINK, "href", /([^#]*)/.exec(document.location)[1] + "#pm-icon-" + name)
            } else
                data.dom ? node.appendChild(data.dom.cloneNode(!0)) : (node.appendChild(document.createElement("span")).textContent = data.text || "",
                data.style && (node.firstChild.style.cssText = data.style));
            return node
        }
        function buildSVG(name, data) {
            svgCollection || (svgCollection = document.createElementNS(SVG, "svg"),
            svgCollection.style.display = "none",
            document.body.insertBefore(svgCollection, document.body.firstChild));
            var sym = document.createElementNS(SVG, "symbol");
            sym.id = "pm-icon-" + name,
            sym.setAttribute("viewBox", "0 0 " + data.width + " " + data.height);
            var path = sym.appendChild(document.createElementNS(SVG, "path"));
            path.setAttribute("d", data.path),
            svgCollection.appendChild(sym),
            svgBuilt[name] = !0
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.getIcon = getIcon;
        var _dom = require("../dom")
          , svgCollection = null
          , svgBuilt = Object.create(null)
          , SVG = "http://www.w3.org/2000/svg"
          , XLINK = "http://www.w3.org/1999/xlink"
          , prefix = "ProseMirror-icon";
        (0,
        _dom.insertCSS)("\n." + prefix + " {\n  display: inline-block;\n  line-height: .8;\n  vertical-align: -2px; /* Compensate for padding */\n  padding: 2px 8px;\n  cursor: pointer;\n}\n\n." + prefix + " svg {\n  fill: currentColor;\n  height: 1em;\n}\n\n." + prefix + " span {\n  vertical-align: text-top;\n}")
    }
    , {
        "../dom": 1
    }],
    28: [function(require, module, exports) {
        "use strict";
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            }
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function title(pm, command) {
            if (!command.label)
                return null;
            var label = pm.translate(command.label)
              , key = command.name && pm.keyForCommand(command.name);
            return key ? label + " (" + key + ")" : label
        }
        function renderDropdownItems(items, pm) {
            for (var rendered = [], i = 0; i < items.length; i++) {
                var inner = items[i].render(pm);
                inner && rendered.push((0,
                _dom.elt)("div", {
                    "class": prefix + "-dropdown-item"
                }, inner))
            }
            return rendered
        }
        function resolveGroup(pm, content) {
            for (var result = void 0, isArray = Array.isArray(content), i = 0; i < (isArray ? content.length : 1); i++) {
                var cur = isArray ? content[i] : content;
                if (cur instanceof MenuCommandGroup) {
                    var elts = cur.get(pm);
                    if (!isArray || 1 == content.length)
                        return elts;
                    result = (result || content.slice(0, i)).concat(elts)
                } else
                    result && result.push(cur)
            }
            return result || (isArray ? content : [content])
        }
        function renderGrouped(pm, content) {
            for (var result = document.createDocumentFragment(), needSep = !1, i = 0; i < content.length; i++) {
                for (var items = resolveGroup(pm, content[i]), added = !1, j = 0; j < items.length; j++) {
                    var rendered = items[j].render(pm);
                    rendered && (!added && needSep && result.appendChild(separator()),
                    result.appendChild((0,
                    _dom.elt)("span", {
                        "class": prefix + "item"
                    }, rendered)),
                    added = !0)
                }
                added && (needSep = !0)
            }
            return result
        }
        function separator() {
            return (0,
            _dom.elt)("span", {
                "class": prefix + "separator"
            })
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.historyGroup = exports.blockGroup = exports.textblockMenu = exports.insertMenu = exports.inlineGroup = exports.DropdownSubmenu = exports.Dropdown = exports.MenuCommandGroup = exports.MenuCommand = void 0,
        exports.resolveGroup = resolveGroup,
        exports.renderGrouped = renderGrouped;
        var _dom = require("../dom")
          , _sortedinsert = require("../util/sortedinsert")
          , _sortedinsert2 = _interopRequireDefault(_sortedinsert)
          , _obj = require("../util/obj")
          , _icons = require("./icons")
          , prefix = "ProseMirror-menu"
          , MenuCommand = exports.MenuCommand = function() {
            function MenuCommand(command, options) {
                _classCallCheck(this, MenuCommand),
                this.command_ = command,
                this.options = options
            }
            return _createClass(MenuCommand, [{
                key: "command",
                value: function(pm) {
                    return "string" == typeof this.command_ ? pm.commands[this.command_] : this.command_
                }
            }, {
                key: "render",
                value: function(pm) {
                    var cmd = this.command(pm)
                      , disabled = !1;
                    if (cmd) {
                        if ("ignore" != this.options.select && !cmd.select(pm)) {
                            if (null == this.options.select || "hide" == this.options.select)
                                return null;
                            "disable" == this.options.select && (disabled = !0)
                        }
                        var disp = this.options.display;
                        if (!disp)
                            throw new RangeError("No display style defined for menu command " + cmd.name);
                        var dom = void 0;
                        if (disp.render)
                            dom = disp.render(cmd, pm);
                        else if ("icon" == disp.type)
                            dom = (0,
                            _icons.getIcon)(cmd.name, disp),
                            !disabled && cmd.active(pm) && dom.classList.add(prefix + "-active");
                        else {
                            if ("label" != disp.type)
                                throw new RangeError("Unsupported command display style: " + disp.type);
                            var label = pm.translate(disp.label || cmd.spec.label);
                            dom = (0,
                            _dom.elt)("div", null, label)
                        }
                        return dom.setAttribute("title", title(pm, cmd)),
                        this.options["class"] && dom.classList.add(this.options["class"]),
                        disabled && dom.classList.add(prefix + "-disabled"),
                        this.options.css && (dom.style.cssText += this.options.css),
                        dom.addEventListener("mousedown", function(e) {
                            e.preventDefault(),
                            e.stopPropagation(),
                            pm.signal("interaction"),
                            cmd.exec(pm, null, dom)
                        }),
                        dom.setAttribute("data-command", this.commandName),
                        dom
                    }
                }
            }, {
                key: "commandName",
                get: function() {
                    return "string" == typeof this.command_ ? this.command_.command : this.command_.name
                }
            }]),
            MenuCommand
        }()
          , MenuCommandGroup = exports.MenuCommandGroup = function() {
            function MenuCommandGroup(name, options) {
                _classCallCheck(this, MenuCommandGroup),
                this.name = name,
                this.options = options
            }
            return _createClass(MenuCommandGroup, [{
                key: "collect",
                value: function(pm) {
                    var _this = this
                      , result = [];
                    for (var name in pm.commands) {
                        var cmd = pm.commands[name]
                          , spec = cmd.spec.menu;
                        spec && spec.group == this.name && (0,
                        _sortedinsert2["default"])(result, {
                            cmd: cmd,
                            rank: null == spec.rank ? 50 : spec.rank
                        }, function(a, b) {
                            return a.rank - b.rank
                        })
                    }
                    return result.map(function(o) {
                        var spec = o.cmd.spec.menu;
                        return _this.options && (spec = (0,
                        _obj.copyObj)(_this.options, (0,
                        _obj.copyObj)(spec))),
                        new MenuCommand(o.cmd,spec)
                    })
                }
            }, {
                key: "get",
                value: function(pm) {
                    var groups = pm.mod.menuGroups || this.startGroups(pm);
                    return groups[this.name] || (groups[this.name] = this.collect(pm))
                }
            }, {
                key: "startGroups",
                value: function(pm) {
                    var clear = function clear() {
                        pm.mod.menuGroups = null,
                        pm.off("commandsChanging", clear)
                    };
                    return pm.on("commandsChanging", clear),
                    pm.mod.menuGroups = Object.create(null)
                }
            }]),
            MenuCommandGroup
        }()
          , Dropdown = exports.Dropdown = function() {
            function Dropdown(options, content) {
                _classCallCheck(this, Dropdown),
                this.options = options || {},
                this.content = content
            }
            return _createClass(Dropdown, [{
                key: "render",
                value: function(pm) {
                    var _this2 = this
                      , items = renderDropdownItems(resolveGroup(pm, this.content), pm);
                    if (items.length) {
                        var label = this.options.activeLabel && this.findActiveIn(this, pm) || this.options.label;
                        label = pm.translate(label);
                        var dom = (0,
                        _dom.elt)("div", {
                            "class": prefix + "-dropdown " + (this.options["class"] || ""),
                            style: this.options.css,
                            title: this.options.title
                        }, label)
                          , open = null;
                        return dom.addEventListener("mousedown", function(e) {
                            e.preventDefault(),
                            e.stopPropagation(),
                            open = open && open() ? null : _this2.expand(pm, dom, items)
                        }),
                        dom
                    }
                }
            }, {
                key: "select",
                value: function(pm) {
                    return resolveGroup(pm, this.content).some(function(e) {
                        return e.select(pm)
                    })
                }
            }, {
                key: "expand",
                value: function(pm, dom, items) {
                    function finish() {
                        return done ? void 0 : (done = !0,
                        pm.off("interaction", finish),
                        pm.wrapper.removeChild(menuDOM),
                        !0)
                    }
                    var box = dom.getBoundingClientRect()
                      , outer = pm.wrapper.getBoundingClientRect()
                      , menuDOM = (0,
                    _dom.elt)("div", {
                        "class": prefix + "-dropdown-menu " + (this.options["class"] || ""),
                        style: "left: " + (box.left - outer.left) + "px; top: " + (box.bottom - outer.top) + "px"
                    }, items)
                      , done = !1;
                    return pm.signal("interaction"),
                    pm.wrapper.appendChild(menuDOM),
                    pm.on("interaction", finish),
                    finish
                }
            }, {
                key: "findActiveIn",
                value: function(element, pm) {
                    for (var items = resolveGroup(pm, element.content), i = 0; i < items.length; i++) {
                        var cur = items[i];
                        if (cur instanceof MenuCommand) {
                            var active = cur.command(pm).active(pm);
                            if (active)
                                return cur.options.activeLabel
                        } else if (cur instanceof DropdownSubmenu) {
                            var found = this.findActiveIn(cur, pm);
                            if (found)
                                return found
                        }
                    }
                }
            }]),
            Dropdown
        }()
          , DropdownSubmenu = exports.DropdownSubmenu = function() {
            function DropdownSubmenu(options, content) {
                _classCallCheck(this, DropdownSubmenu),
                this.options = options || {},
                this.content = content
            }
            return _createClass(DropdownSubmenu, [{
                key: "render",
                value: function(pm) {
                    var items = renderDropdownItems(resolveGroup(pm, this.content), pm);
                    if (items.length) {
                        var label = (0,
                        _dom.elt)("div", {
                            "class": prefix + "-submenu-label"
                        }, pm.translate(this.options.label))
                          , wrap = (0,
                        _dom.elt)("div", {
                            "class": prefix + "-submenu-wrap"
                        }, label, (0,
                        _dom.elt)("div", {
                            "class": prefix + "-submenu"
                        }, items));
                        return label.addEventListener("mousedown", function(e) {
                            e.preventDefault(),
                            e.stopPropagation(),
                            wrap.classList.toggle(prefix + "-submenu-wrap-active")
                        }),
                        wrap
                    }
                }
            }]),
            DropdownSubmenu
        }();
        exports.inlineGroup = new MenuCommandGroup("inline"),
        exports.insertMenu = new Dropdown({
            label: "Insert"
        },new MenuCommandGroup("insert")),
        exports.textblockMenu = new Dropdown({
            label: "Type..",
            displayActive: !0,
            "class": "ProseMirror-textblock-dropdown"
        },[new MenuCommandGroup("textblock"), new DropdownSubmenu({
            label: "Heading"
        },new MenuCommandGroup("textblockHeading"))]),
        exports.blockGroup = new MenuCommandGroup("block"),
        exports.historyGroup = new MenuCommandGroup("history");
        (0,
        _dom.insertCSS)("\n\n.ProseMirror-textblock-dropdown {\n  min-width: 3em;\n}\n\n." + prefix + " {\n  margin: 0 -4px;\n  line-height: 1;\n}\n\n.ProseMirror-tooltip ." + prefix + " {\n  width: -webkit-fit-content;\n  width: fit-content;\n  white-space: pre;\n}\n\n." + prefix + "item {\n  margin-right: 3px;\n  display: inline-block;\n}\n\n." + prefix + "separator {\n  border-right: 1px solid #ddd;\n  margin-right: 3px;\n}\n\n." + prefix + "-dropdown, ." + prefix + "-dropdown-menu {\n  font-size: 90%;\n  white-space: nowrap;\n}\n\n." + prefix + "-dropdown {\n  padding: 1px 14px 1px 4px;\n  display: inline-block;\n  vertical-align: 1px;\n  position: relative;\n  cursor: pointer;\n}\n\n." + prefix + '-dropdown:after {\n  content: "";\n  border-left: 4px solid transparent;\n  border-right: 4px solid transparent;\n  border-top: 4px solid currentColor;\n  opacity: .6;\n  position: absolute;\n  right: 2px;\n  top: calc(50% - 2px);\n}\n\n.' + prefix + "-dropdown-menu, ." + prefix + "-submenu {\n  position: absolute;\n  background: white;\n  color: #666;\n  border: 1px solid #aaa;\n  padding: 2px;\n}\n\n." + prefix + "-dropdown-menu {\n  z-index: 15;\n  min-width: 6em;\n}\n\n." + prefix + "-dropdown-item {\n  cursor: pointer;\n  padding: 2px 8px 2px 4px;\n}\n\n." + prefix + "-dropdown-item:hover {\n  background: #f2f2f2;\n}\n\n." + prefix + "-submenu-wrap {\n  position: relative;\n  margin-right: -4px;\n}\n\n." + prefix + '-submenu-label:after {\n  content: "";\n  border-top: 4px solid transparent;\n  border-bottom: 4px solid transparent;\n  border-left: 4px solid currentColor;\n  opacity: .6;\n  position: absolute;\n  right: 4px;\n  top: calc(50% - 4px);\n}\n\n.' + prefix + "-submenu {\n  display: none;\n  min-width: 4em;\n  left: 100%;\n  top: -3px;\n}\n\n." + prefix + "-active {\n  background: #eee;\n  border-radius: 4px;\n}\n\n." + prefix + "-active {\n  background: #eee;\n  border-radius: 4px;\n}\n\n." + prefix + "-disabled {\n  opacity: .3;\n}\n\n." + prefix + "-submenu-wrap:hover ." + prefix + "-submenu, ." + prefix + "-submenu-wrap-active ." + prefix + "-submenu {\n  display: block;\n}\n")
    }
    , {
        "../dom": 1,
        "../util/obj": 55,
        "../util/sortedinsert": 56,
        "./icons": 27
    }],
    29: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function findWrappingScrollable(node) {
            for (var cur = node.parentNode; cur; cur = cur.parentNode)
                if (cur.scrollHeight > cur.clientHeight)
                    return cur
        }
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj
        }
        : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol ? "symbol" : typeof obj
        }
          , _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }()
          , _edit = require("../edit")
          , _dom = require("../dom")
          , _update = require("../ui/update")
          , _menu = require("./menu")
          , prefix = "ProseMirror-menubar";
        (0,
        _edit.defineOption)("menuBar", !1, function(pm, value) {
            pm.mod.menuBar && pm.mod.menuBar.detach(),
            pm.mod.menuBar = value ? new MenuBar(pm,value) : null
        });
        var defaultMenu = [_menu.inlineGroup, _menu.insertMenu, [_menu.textblockMenu, _menu.blockGroup], _menu.historyGroup]
          , MenuBar = function() {
            function MenuBar(pm, config) {
                var _this = this;
                _classCallCheck(this, MenuBar),
                this.pm = pm,
                this.config = config || {},
                this.wrapper = pm.wrapper.insertBefore((0,
                _dom.elt)("div", {
                    "class": prefix
                }), pm.wrapper.firstChild),
                this.spacer = null,
                this.maxHeight = 0,
                this.widthForMaxHeight = 0,
                this.updater = new _update.UpdateScheduler(pm,"selectionChange change activeMarkChange commandsChanged",function() {
                    return _this.update()
                }
                ),
                this.content = config.content || defaultMenu,
                this.updater.force(),
                this.floating = !1,
                this.config["float"] && (this.updateFloat(),
                this.scrollFunc = function() {
                    document.body.contains(_this.pm.wrapper) ? _this.updateFloat() : window.removeEventListener("scroll", _this.scrollFunc)
                }
                ,
                window.addEventListener("scroll", this.scrollFunc))
            }
            return _createClass(MenuBar, [{
                key: "detach",
                value: function() {
                    this.updater.detach(),
                    this.wrapper.parentNode.removeChild(this.wrapper),
                    this.scrollFunc && window.removeEventListener("scroll", this.scrollFunc)
                }
            }, {
                key: "update",
                value: function() {
                    var _this2 = this;
                    return this.wrapper.textContent = "",
                    this.wrapper.appendChild((0,
                    _menu.renderGrouped)(this.pm, this.content)),
                    this.floating ? this.updateScrollCursor() : function() {
                        return _this2.wrapper.offsetWidth != _this2.widthForMaxHeight && (_this2.widthForMaxHeight = _this2.wrapper.offsetWidth,
                        _this2.maxHeight = 0),
                        _this2.wrapper.offsetHeight > _this2.maxHeight ? (_this2.maxHeight = _this2.wrapper.offsetHeight,
                        function() {
                            _this2.wrapper.style.minHeight = _this2.maxHeight + "px"
                        }
                        ) : void 0
                    }
                }
            }, {
                key: "updateFloat",
                value: function() {
                    var editorRect = this.pm.wrapper.getBoundingClientRect();
                    if (this.floating)
                        if (editorRect.top >= 0 || editorRect.bottom < this.wrapper.offsetHeight + 10)
                            this.floating = !1,
                            this.wrapper.style.position = this.wrapper.style.left = this.wrapper.style.width = "",
                            this.wrapper.style.display = "",
                            this.spacer.parentNode.removeChild(this.spacer),
                            this.spacer = null;
                        else {
                            var border = (this.pm.wrapper.offsetWidth - this.pm.wrapper.clientWidth) / 2;
                            this.wrapper.style.left = editorRect.left + border + "px",
                            this.wrapper.style.display = editorRect.top > window.innerHeight ? "none" : ""
                        }
                    else if (editorRect.top < 0 && editorRect.bottom >= this.wrapper.offsetHeight + 10) {
                        this.floating = !0;
                        var menuRect = this.wrapper.getBoundingClientRect();
                        this.wrapper.style.left = menuRect.left + "px",
                        this.wrapper.style.width = menuRect.width + "px",
                        this.wrapper.style.position = "fixed",
                        this.spacer = (0,
                        _dom.elt)("div", {
                            "class": prefix + "-spacer",
                            style: "height: " + menuRect.height + "px"
                        }),
                        this.pm.wrapper.insertBefore(this.spacer, this.wrapper)
                    }
                }
            }, {
                key: "updateScrollCursor",
                value: function() {
                    var _this3 = this;
                    if (!this.floating)
                        return null;
                    var head = this.pm.selection.head;
                    return head ? function() {
                        var cursorPos = _this3.pm.coordsAtPos(head)
                          , menuRect = _this3.wrapper.getBoundingClientRect();
                        if (cursorPos.top < menuRect.bottom && cursorPos.bottom > menuRect.top) {
                            var _ret = function() {
                                var scrollable = findWrappingScrollable(_this3.pm.wrapper);
                                return scrollable ? {
                                    v: function() {
                                        scrollable.scrollTop -= menuRect.bottom - cursorPos.top
                                    }
                                } : void 0
                            }();
                            if ("object" === ("undefined" == typeof _ret ? "undefined" : _typeof(_ret)))
                                return _ret.v
                        }
                    }
                    : null
                }
            }]),
            MenuBar
        }();
        (0,
        _dom.insertCSS)("\n." + prefix + " {\n  border-top-left-radius: inherit;\n  border-top-right-radius: inherit;\n  position: relative;\n  min-height: 1em;\n  color: #666;\n  padding: 1px 6px;\n  top: 0; left: 0; right: 0;\n  border-bottom: 1px solid silver;\n  background: white;\n  z-index: 10;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: visible;\n}\n")
    }
    , {
        "../dom": 1,
        "../edit": 11,
        "../ui/update": 51,
        "./menu": 28
    }],
    30: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function topCenterOfSelection() {
            var range = window.getSelection().getRangeAt(0)
              , rects = range.getClientRects();
            if (!rects.length)
                return range.getBoundingClientRect();
            for (var _rects$ = rects[0], left = _rects$.left, right = _rects$.right, top = _rects$.top, i = 1; left == right && rects.length > i; ) {
                var _rects = rects[i++];
                left = _rects.left,
                right = _rects.right,
                top = _rects.top
            }
            for (; i < rects.length; i++)
                rects[i].top < rects[0].bottom - 1 && (i == rects.length - 1 || Math.abs(rects[i + 1].left - rects[i].left) > 1) && (left = Math.min(left, rects[i].left),
                right = Math.max(right, rects[i].right),
                top = Math.min(top, rects[i].top));
            return {
                top: top,
                left: (left + right) / 2
            }
        }
        function topOfNodeSelection(pm) {
            var selected = pm.content.querySelector(".ProseMirror-selectednode");
            if (!selected)
                return {
                    left: 0,
                    top: 0
                };
            var box = selected.getBoundingClientRect();
            return {
                left: Math.min((box.left + box.right) / 2, box.left + 20),
                top: box.top
            }
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }()
          , _edit = require("../edit")
          , _dom = require("../dom")
          , _tooltip = require("../ui/tooltip")
          , _update = require("../ui/update")
          , _menu = require("./menu")
          , classPrefix = "ProseMirror-tooltipmenu";
        (0,
        _edit.defineOption)("tooltipMenu", !1, function(pm, value) {
            pm.mod.tooltipMenu && pm.mod.tooltipMenu.detach(),
            pm.mod.tooltipMenu = value ? new TooltipMenu(pm,value) : null
        });
        var defaultInline = [_menu.inlineGroup, _menu.insertMenu]
          , defaultBlock = [[_menu.textblockMenu, _menu.blockGroup]]
          , TooltipMenu = function() {
            function TooltipMenu(pm, config) {
                var _this = this;
                _classCallCheck(this, TooltipMenu),
                this.pm = pm,
                this.config = config || {},
                this.showLinks = this.config.showLinks !== !1,
                this.selectedBlockMenu = this.config.selectedBlockMenu,
                this.updater = new _update.UpdateScheduler(pm,"change selectionChange blur focus commandsChanged",function() {
                    return _this.update()
                }
                ),
                this.onContextMenu = this.onContextMenu.bind(this),
                pm.content.addEventListener("contextmenu", this.onContextMenu),
                this.tooltip = new _tooltip.Tooltip(pm.wrapper,"above"),
                this.inlineContent = this.config.inlineContent || defaultInline,
                this.blockContent = this.config.blockContent || defaultBlock,
                this.selectedBlockContent = this.config.selectedBlockContent || this.inlineContent.concat(this.blockContent)
            }
            return _createClass(TooltipMenu, [{
                key: "detach",
                value: function() {
                    this.updater.detach(),
                    this.tooltip.detach(),
                    this.pm.content.removeEventListener("contextmenu", this.onContextMenu)
                }
            }, {
                key: "show",
                value: function(content, coords) {
                    this.tooltip.open((0,
                    _dom.elt)("div", null, (0,
                    _menu.renderGrouped)(this.pm, content)), coords)
                }
            }, {
                key: "update",
                value: function() {
                    var _this2 = this
                      , _pm$selection = this.pm.selection
                      , empty = _pm$selection.empty
                      , node = _pm$selection.node
                      , from = _pm$selection.from
                      , to = _pm$selection.to
                      , link = void 0;
                    if (this.pm.hasFocus()) {
                        if (node && node.isBlock)
                            return function() {
                                var coords = topOfNodeSelection(_this2.pm);
                                return function() {
                                    return _this2.show(_this2.blockContent, coords)
                                }
                            }
                            ;
                        if (!empty)
                            return function() {
                                var coords = node ? topOfNodeSelection(_this2.pm) : topCenterOfSelection()
                                  , $from = void 0
                                  , showBlock = _this2.selectedBlockMenu && 0 == ($from = _this2.pm.doc.resolve(from)).parentOffset && $from.end($from.depth) == to;
                                return function() {
                                    return _this2.show(showBlock ? _this2.selectedBlockContent : _this2.inlineContent, coords)
                                }
                            }
                            ;
                        if (this.selectedBlockMenu && 0 == this.pm.doc.resolve(from).parent.content.size)
                            return function() {
                                var coords = _this2.pm.coordsAtPos(from);
                                return function() {
                                    return _this2.show(_this2.blockContent, coords)
                                }
                            }
                            ;
                        if (this.showLinks && (link = this.linkUnderCursor()))
                            return function() {
                                var coords = _this2.pm.coordsAtPos(from);
                                return function() {
                                    return _this2.showLink(link, coords)
                                }
                            }
                            ;
                        this.tooltip.close()
                    } else
                        this.tooltip.close()
                }
            }, {
                key: "linkUnderCursor",
                value: function() {
                    var head = this.pm.selection.head;
                    if (!head)
                        return null;
                    var marks = this.pm.doc.marksAt(head);
                    return marks.reduce(function(found, m) {
                        return found || "link" == m.type.name && m
                    }, null)
                }
            }, {
                key: "showLink",
                value: function(link, pos) {
                    var node = (0,
                    _dom.elt)("div", {
                        "class": classPrefix + "-linktext"
                    }, (0,
                    _dom.elt)("a", {
                        href: link.attrs.href,
                        title: link.attrs.title
                    }, link.attrs.href));
                    this.tooltip.open(node, pos)
                }
            }, {
                key: "onContextMenu",
                value: function(e) {
                    if (this.pm.selection.empty) {
                        var pos = this.pm.posAtCoords({
                            left: e.clientX,
                            top: e.clientY
                        });
                        pos && pos.isValid(this.pm.doc, !0) && (this.pm.setTextSelection(pos, pos),
                        this.pm.flush(),
                        this.show(this.inlineContent, topCenterOfSelection()))
                    }
                }
            }]),
            TooltipMenu
        }();
        (0,
        _dom.insertCSS)("\n\n." + classPrefix + "-linktext a {\n  color: #444;\n  text-decoration: none;\n  padding: 0 5px;\n}\n\n." + classPrefix + "-linktext a:hover {\n  text-decoration: underline;\n}\n\n")
    }
    , {
        "../dom": 1,
        "../edit": 11,
        "../ui/tooltip": 50,
        "../ui/update": 51,
        "./menu": 28
    }],
    31: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.defaultSchema = exports.CodeMark = exports.LinkMark = exports.StrongMark = exports.EmMark = exports.HardBreak = exports.Image = exports.Paragraph = exports.CodeBlock = exports.Heading = exports.HorizontalRule = exports.ListItem = exports.BulletList = exports.OrderedList = exports.BlockQuote = exports.Doc = void 0;
        var _schema = require("./schema")
          , Doc = exports.Doc = function(_Block) {
            function Doc() {
                return _classCallCheck(this, Doc),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Doc).apply(this, arguments))
            }
            return _inherits(Doc, _Block),
            _createClass(Doc, [{
                key: "kind",
                get: function() {
                    return null
                }
            }]),
            Doc
        }(_schema.Block)
          , BlockQuote = exports.BlockQuote = function(_Block2) {
            function BlockQuote() {
                return _classCallCheck(this, BlockQuote),
                _possibleConstructorReturn(this, Object.getPrototypeOf(BlockQuote).apply(this, arguments))
            }
            return _inherits(BlockQuote, _Block2),
            BlockQuote
        }(_schema.Block);
        _schema.NodeKind.list_item = new _schema.NodeKind("list_item");
        var OrderedList = exports.OrderedList = function(_Block3) {
            function OrderedList() {
                return _classCallCheck(this, OrderedList),
                _possibleConstructorReturn(this, Object.getPrototypeOf(OrderedList).apply(this, arguments))
            }
            return _inherits(OrderedList, _Block3),
            _createClass(OrderedList, [{
                key: "contains",
                get: function() {
                    return _schema.NodeKind.list_item
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        order: new _schema.Attribute({
                            "default": "1"
                        })
                    }
                }
            }]),
            OrderedList
        }(_schema.Block)
          , BulletList = exports.BulletList = function(_Block4) {
            function BulletList() {
                return _classCallCheck(this, BulletList),
                _possibleConstructorReturn(this, Object.getPrototypeOf(BulletList).apply(this, arguments))
            }
            return _inherits(BulletList, _Block4),
            _createClass(BulletList, [{
                key: "contains",
                get: function() {
                    return _schema.NodeKind.list_item
                }
            }]),
            BulletList
        }(_schema.Block)
          , ListItem = exports.ListItem = function(_Block5) {
            function ListItem() {
                return _classCallCheck(this, ListItem),
                _possibleConstructorReturn(this, Object.getPrototypeOf(ListItem).apply(this, arguments))
            }
            return _inherits(ListItem, _Block5),
            _createClass(ListItem, [{
                key: "kind",
                get: function() {
                    return _schema.NodeKind.list_item
                }
            }]),
            ListItem
        }(_schema.Block)
          , HorizontalRule = exports.HorizontalRule = function(_Block6) {
            function HorizontalRule() {
                return _classCallCheck(this, HorizontalRule),
                _possibleConstructorReturn(this, Object.getPrototypeOf(HorizontalRule).apply(this, arguments))
            }
            return _inherits(HorizontalRule, _Block6),
            _createClass(HorizontalRule, [{
                key: "contains",
                get: function() {
                    return null
                }
            }]),
            HorizontalRule
        }(_schema.Block)
          , Heading = exports.Heading = function(_Textblock) {
            function Heading() {
                return _classCallCheck(this, Heading),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Heading).apply(this, arguments))
            }
            return _inherits(Heading, _Textblock),
            _createClass(Heading, [{
                key: "attrs",
                get: function() {
                    return {
                        level: new _schema.Attribute({
                            "default": "1"
                        })
                    }
                }
            }, {
                key: "maxLevel",
                get: function() {
                    return 6
                }
            }]),
            Heading
        }(_schema.Textblock)
          , CodeBlock = exports.CodeBlock = function(_Textblock2) {
            function CodeBlock() {
                return _classCallCheck(this, CodeBlock),
                _possibleConstructorReturn(this, Object.getPrototypeOf(CodeBlock).apply(this, arguments))
            }
            return _inherits(CodeBlock, _Textblock2),
            _createClass(CodeBlock, [{
                key: "contains",
                get: function() {
                    return _schema.NodeKind.text
                }
            }, {
                key: "containsMarks",
                get: function() {
                    return !1
                }
            }, {
                key: "isCode",
                get: function() {
                    return !0
                }
            }]),
            CodeBlock
        }(_schema.Textblock)
          , Paragraph = exports.Paragraph = function(_Textblock3) {
            function Paragraph() {
                return _classCallCheck(this, Paragraph),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Paragraph).apply(this, arguments))
            }
            return _inherits(Paragraph, _Textblock3),
            _createClass(Paragraph, [{
                key: "defaultTextblock",
                get: function() {
                    return !0
                }
            }]),
            Paragraph
        }(_schema.Textblock)
          , Image = exports.Image = function(_Inline) {
            function Image() {
                return _classCallCheck(this, Image),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Image).apply(this, arguments))
            }
            return _inherits(Image, _Inline),
            _createClass(Image, [{
                key: "attrs",
                get: function() {
                    return {
                        src: new _schema.Attribute,
                        alt: new _schema.Attribute({
                            "default": ""
                        }),
                        title: new _schema.Attribute({
                            "default": ""
                        })
                    }
                }
            }, {
                key: "draggable",
                get: function() {
                    return !0
                }
            }]),
            Image
        }(_schema.Inline)
          , HardBreak = exports.HardBreak = function(_Inline2) {
            function HardBreak() {
                return _classCallCheck(this, HardBreak),
                _possibleConstructorReturn(this, Object.getPrototypeOf(HardBreak).apply(this, arguments))
            }
            return _inherits(HardBreak, _Inline2),
            _createClass(HardBreak, [{
                key: "selectable",
                get: function() {
                    return !1
                }
            }, {
                key: "isBR",
                get: function() {
                    return !0
                }
            }]),
            HardBreak
        }(_schema.Inline)
          , EmMark = exports.EmMark = function(_MarkType) {
            function EmMark() {
                return _classCallCheck(this, EmMark),
                _possibleConstructorReturn(this, Object.getPrototypeOf(EmMark).apply(this, arguments))
            }
            return _inherits(EmMark, _MarkType),
            _createClass(EmMark, null, [{
                key: "rank",
                get: function() {
                    return 31
                }
            }]),
            EmMark
        }(_schema.MarkType)
          , StrongMark = exports.StrongMark = function(_MarkType2) {
            function StrongMark() {
                return _classCallCheck(this, StrongMark),
                _possibleConstructorReturn(this, Object.getPrototypeOf(StrongMark).apply(this, arguments))
            }
            return _inherits(StrongMark, _MarkType2),
            _createClass(StrongMark, null, [{
                key: "rank",
                get: function() {
                    return 32
                }
            }]),
            StrongMark
        }(_schema.MarkType)
          , LinkMark = exports.LinkMark = function(_MarkType3) {
            function LinkMark() {
                return _classCallCheck(this, LinkMark),
                _possibleConstructorReturn(this, Object.getPrototypeOf(LinkMark).apply(this, arguments))
            }
            return _inherits(LinkMark, _MarkType3),
            _createClass(LinkMark, [{
                key: "attrs",
                get: function() {
                    return {
                        href: new _schema.Attribute,
                        title: new _schema.Attribute({
                            "default": ""
                        })
                    }
                }
            }], [{
                key: "rank",
                get: function() {
                    return 60
                }
            }]),
            LinkMark
        }(_schema.MarkType)
          , CodeMark = exports.CodeMark = function(_MarkType4) {
            function CodeMark() {
                return _classCallCheck(this, CodeMark),
                _possibleConstructorReturn(this, Object.getPrototypeOf(CodeMark).apply(this, arguments))
            }
            return _inherits(CodeMark, _MarkType4),
            _createClass(CodeMark, [{
                key: "isCode",
                get: function() {
                    return !0
                }
            }], [{
                key: "rank",
                get: function() {
                    return 101
                }
            }]),
            CodeMark
        }(_schema.MarkType)
          , defaultSpec = new _schema.SchemaSpec({
            doc: Doc,
            blockquote: BlockQuote,
            ordered_list: OrderedList,
            bullet_list: BulletList,
            list_item: ListItem,
            horizontal_rule: HorizontalRule,
            paragraph: Paragraph,
            heading: Heading,
            code_block: CodeBlock,
            text: _schema.Text,
            image: Image,
            hard_break: HardBreak
        },{
            em: EmMark,
            strong: StrongMark,
            link: LinkMark,
            code: CodeMark
        });
        exports.defaultSchema = new _schema.Schema(defaultSpec)
    }
    , {
        "./schema": 39
    }],
    32: [function(require, module, exports) {
        "use strict";
        function findDiffStart(a, b) {
            for (var pos = arguments.length <= 2 || void 0 === arguments[2] ? 0 : arguments[2], i = 0; ; i++) {
                if (i == a.childCount || i == b.childCount)
                    return a.childCount == b.childCount ? null : pos;
                var childA = a.child(i)
                  , childB = b.child(i);
                if (childA != childB) {
                    if (!childA.sameMarkup(childB))
                        return pos;
                    if (childA.isText && childA.text != childB.text) {
                        for (var j = 0; childA.text[j] == childB.text[j]; j++)
                            pos++;
                        return pos
                    }
                    if (childA.content.size || childB.content.size) {
                        var inner = findDiffStart(childA.content, childB.content, pos + 1);
                        if (null != inner)
                            return inner
                    }
                    pos += childA.nodeSize
                } else
                    pos += childA.nodeSize
            }
        }
        function findDiffEnd(a, b) {
            for (var posA = arguments.length <= 2 || void 0 === arguments[2] ? a.size : arguments[2], posB = arguments.length <= 3 || void 0 === arguments[3] ? b.size : arguments[3], iA = a.childCount, iB = b.childCount; ; ) {
                if (0 == iA || 0 == iB)
                    return iA == iB ? null : {
                        a: posA,
                        b: posB
                    };
                var childA = a.child(--iA)
                  , childB = b.child(--iB)
                  , size = childA.nodeSize;
                if (childA != childB) {
                    if (!childA.sameMarkup(childB))
                        return {
                            a: posA,
                            b: posB
                        };
                    if (childA.isText && childA.text != childB.text) {
                        for (var same = 0, minSize = Math.min(childA.text.length, childB.text.length); minSize > same && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]; )
                            same++,
                            posA--,
                            posB--;
                        return {
                            a: posA,
                            b: posB
                        }
                    }
                    if (childA.content.size || childB.content.size) {
                        var inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1);
                        if (inner)
                            return inner
                    }
                    posA -= size,
                    posB -= size
                } else
                    posA -= size,
                    posB -= size
            }
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.findDiffStart = findDiffStart,
        exports.findDiffEnd = findDiffEnd
    }
    , {}],
    33: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function retIndex(index, offset) {
            return found.index = index,
            found.offset = offset,
            found
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var Fragment = exports.Fragment = function() {
            function Fragment(content, size) {
                if (_classCallCheck(this, Fragment),
                this.content = content,
                this.size = size || 0,
                null == size)
                    for (var i = 0; i < content.length; i++)
                        this.size += content[i].nodeSize
            }
            return _createClass(Fragment, [{
                key: "toString",
                value: function() {
                    return "<" + this.toStringInner() + ">"
                }
            }, {
                key: "toStringInner",
                value: function() {
                    return this.content.join(", ")
                }
            }, {
                key: "nodesBetween",
                value: function(from, to, f, nodeStart, parent) {
                    for (var i = 0, pos = 0; to > pos; i++) {
                        var child = this.content[i]
                          , end = pos + child.nodeSize;
                        if (end > from && f(child, nodeStart + pos, parent) !== !1 && child.content.size) {
                            var start = pos + 1;
                            child.nodesBetween(Math.max(0, from - start), Math.min(child.content.size, to - start), f, nodeStart + start)
                        }
                        pos = end
                    }
                }
            }, {
                key: "cut",
                value: function(from, to) {
                    if (null == to && (to = this.size),
                    0 == from && to == this.size)
                        return this;
                    var result = []
                      , size = 0;
                    if (to > from)
                        for (var i = 0, pos = 0; to > pos; i++) {
                            var child = this.content[i]
                              , end = pos + child.nodeSize;
                            end > from && ((from > pos || end > to) && (child = child.isText ? child.cut(Math.max(0, from - pos), Math.min(child.text.length, to - pos)) : child.cut(Math.max(0, from - pos - 1), Math.min(child.content.size, to - pos - 1))),
                            result.push(child),
                            size += child.nodeSize),
                            pos = end
                        }
                    return new Fragment(result,size)
                }
            }, {
                key: "append",
                value: function(other) {
                    if (!other.size)
                        return this;
                    if (!this.size)
                        return other;
                    var last = this.lastChild
                      , first = other.firstChild
                      , content = this.content.slice()
                      , i = 0;
                    for (last.isText && last.sameMarkup(first) && (content[content.length - 1] = last.copy(last.text + first.text),
                    i = 1); i < other.content.length; i++)
                        content.push(other.content[i]);
                    return new Fragment(content,this.size + other.size)
                }
            }, {
                key: "replaceChild",
                value: function(index, node) {
                    var copy = this.content.slice()
                      , size = this.size + node.nodeSize - copy[index].nodeSize;
                    return copy[index] = node,
                    new Fragment(copy,size)
                }
            }, {
                key: "addToStart",
                value: function(node) {
                    return new Fragment([node].concat(this.content),this.size + node.nodeSize)
                }
            }, {
                key: "addToEnd",
                value: function(node) {
                    return new Fragment(this.content.concat(node),this.size + node.nodeSize)
                }
            }, {
                key: "toJSON",
                value: function() {
                    return this.content.length ? this.content.map(function(n) {
                        return n.toJSON()
                    }) : null
                }
            }, {
                key: "eq",
                value: function(other) {
                    if (this.content.length != other.content.length)
                        return !1;
                    for (var i = 0; i < this.content.length; i++)
                        if (!this.content[i].eq(other.content[i]))
                            return !1;
                    return !0
                }
            }, {
                key: "child",
                value: function(index) {
                    var found = this.content[index];
                    if (!found)
                        throw new RangeError("Index " + index + " out of range for " + this);
                    return found
                }
            }, {
                key: "maybeChild",
                value: function(index) {
                    return this.content[index]
                }
            }, {
                key: "forEach",
                value: function(f) {
                    for (var i = 0, p = 0; i < this.content.length; i++) {
                        var child = this.content[i];
                        f(child, p),
                        p += child.nodeSize
                    }
                }
            }, {
                key: "leastSuperKind",
                value: function() {
                    for (var kind = void 0, i = this.childCount - 1; i >= 0; i--) {
                        var cur = this.child(i).type.kind;
                        kind = kind ? kind.sharedSuperKind(cur) : cur
                    }
                    return kind
                }
            }, {
                key: "findIndex",
                value: function(pos) {
                    var round = arguments.length <= 1 || void 0 === arguments[1] ? -1 : arguments[1];
                    if (0 == pos)
                        return retIndex(0, pos);
                    if (pos == this.size)
                        return retIndex(this.content.length, pos);
                    if (pos > this.size || 0 > pos)
                        throw new RangeError("Position " + pos + " outside of fragment (" + this + ")");
                    for (var i = 0, curPos = 0; ; i++) {
                        var cur = this.child(i)
                          , end = curPos + cur.nodeSize;
                        if (end >= pos)
                            return end == pos || round > 0 ? retIndex(i + 1, end) : retIndex(i, curPos);
                        curPos = end
                    }
                }
            }, {
                key: "textContent",
                get: function() {
                    var text = "";
                    return this.content.forEach(function(n) {
                        return text += n.textContent
                    }),
                    text
                }
            }, {
                key: "firstChild",
                get: function() {
                    return this.content.length ? this.content[0] : null
                }
            }, {
                key: "lastChild",
                get: function() {
                    return this.content.length ? this.content[this.content.length - 1] : null
                }
            }, {
                key: "childCount",
                get: function() {
                    return this.content.length
                }
            }], [{
                key: "fromJSON",
                value: function(schema, value) {
                    return value ? new Fragment(value.map(schema.nodeFromJSON)) : Fragment.empty
                }
            }, {
                key: "fromArray",
                value: function(array) {
                    if (!array.length)
                        return Fragment.empty;
                    for (var joined = void 0, size = 0, i = 0; i < array.length; i++) {
                        var node = array[i];
                        size += node.nodeSize,
                        i && node.isText && array[i - 1].sameMarkup(node) ? (joined || (joined = array.slice(0, i)),
                        joined[joined.length - 1] = node.copy(joined[joined.length - 1].text + node.text)) : joined && joined.push(node)
                    }
                    return new Fragment(joined || array,size)
                }
            }, {
                key: "from",
                value: function(nodes) {
                    return nodes ? nodes instanceof Fragment ? nodes : Array.isArray(nodes) ? this.fromArray(nodes) : new Fragment([nodes],nodes.nodeSize) : Fragment.empty
                }
            }]),
            Fragment
        }()
          , found = {
            index: 0,
            offset: 0
        };
        Fragment.empty = new Fragment([],0)
    }
    , {}],
    34: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var _node = require("./node");
        Object.defineProperty(exports, "Node", {
            enumerable: !0,
            get: function() {
                return _node.Node
            }
        });
        var _resolvedpos = require("./resolvedpos");
        Object.defineProperty(exports, "ResolvedPos", {
            enumerable: !0,
            get: function() {
                return _resolvedpos.ResolvedPos
            }
        });
        var _fragment = require("./fragment");
        Object.defineProperty(exports, "Fragment", {
            enumerable: !0,
            get: function() {
                return _fragment.Fragment
            }
        });
        var _replace = require("./replace");
        Object.defineProperty(exports, "Slice", {
            enumerable: !0,
            get: function() {
                return _replace.Slice
            }
        }),
        Object.defineProperty(exports, "ReplaceError", {
            enumerable: !0,
            get: function() {
                return _replace.ReplaceError
            }
        });
        var _mark = require("./mark");
        Object.defineProperty(exports, "Mark", {
            enumerable: !0,
            get: function() {
                return _mark.Mark
            }
        });
        var _schema = require("./schema");
        Object.defineProperty(exports, "SchemaSpec", {
            enumerable: !0,
            get: function() {
                return _schema.SchemaSpec
            }
        }),
        Object.defineProperty(exports, "Schema", {
            enumerable: !0,
            get: function() {
                return _schema.Schema
            }
        }),
        Object.defineProperty(exports, "NodeType", {
            enumerable: !0,
            get: function() {
                return _schema.NodeType
            }
        }),
        Object.defineProperty(exports, "Block", {
            enumerable: !0,
            get: function() {
                return _schema.Block
            }
        }),
        Object.defineProperty(exports, "Textblock", {
            enumerable: !0,
            get: function() {
                return _schema.Textblock
            }
        }),
        Object.defineProperty(exports, "Inline", {
            enumerable: !0,
            get: function() {
                return _schema.Inline
            }
        }),
        Object.defineProperty(exports, "Text", {
            enumerable: !0,
            get: function() {
                return _schema.Text
            }
        }),
        Object.defineProperty(exports, "MarkType", {
            enumerable: !0,
            get: function() {
                return _schema.MarkType
            }
        }),
        Object.defineProperty(exports, "Attribute", {
            enumerable: !0,
            get: function() {
                return _schema.Attribute
            }
        }),
        Object.defineProperty(exports, "NodeKind", {
            enumerable: !0,
            get: function() {
                return _schema.NodeKind
            }
        });
        var _defaultschema = require("./defaultschema");
        Object.defineProperty(exports, "defaultSchema", {
            enumerable: !0,
            get: function() {
                return _defaultschema.defaultSchema
            }
        }),
        Object.defineProperty(exports, "Doc", {
            enumerable: !0,
            get: function() {
                return _defaultschema.Doc
            }
        }),
        Object.defineProperty(exports, "BlockQuote", {
            enumerable: !0,
            get: function() {
                return _defaultschema.BlockQuote
            }
        }),
        Object.defineProperty(exports, "OrderedList", {
            enumerable: !0,
            get: function() {
                return _defaultschema.OrderedList
            }
        }),
        Object.defineProperty(exports, "BulletList", {
            enumerable: !0,
            get: function() {
                return _defaultschema.BulletList
            }
        }),
        Object.defineProperty(exports, "ListItem", {
            enumerable: !0,
            get: function() {
                return _defaultschema.ListItem
            }
        }),
        Object.defineProperty(exports, "HorizontalRule", {
            enumerable: !0,
            get: function() {
                return _defaultschema.HorizontalRule
            }
        }),
        Object.defineProperty(exports, "Paragraph", {
            enumerable: !0,
            get: function() {
                return _defaultschema.Paragraph
            }
        }),
        Object.defineProperty(exports, "Heading", {
            enumerable: !0,
            get: function() {
                return _defaultschema.Heading
            }
        }),
        Object.defineProperty(exports, "CodeBlock", {
            enumerable: !0,
            get: function() {
                return _defaultschema.CodeBlock
            }
        }),
        Object.defineProperty(exports, "Image", {
            enumerable: !0,
            get: function() {
                return _defaultschema.Image
            }
        }),
        Object.defineProperty(exports, "HardBreak", {
            enumerable: !0,
            get: function() {
                return _defaultschema.HardBreak
            }
        }),
        Object.defineProperty(exports, "CodeMark", {
            enumerable: !0,
            get: function() {
                return _defaultschema.CodeMark
            }
        }),
        Object.defineProperty(exports, "EmMark", {
            enumerable: !0,
            get: function() {
                return _defaultschema.EmMark
            }
        }),
        Object.defineProperty(exports, "StrongMark", {
            enumerable: !0,
            get: function() {
                return _defaultschema.StrongMark
            }
        }),
        Object.defineProperty(exports, "LinkMark", {
            enumerable: !0,
            get: function() {
                return _defaultschema.LinkMark
            }
        });
        var _diff = require("./diff");
        Object.defineProperty(exports, "findDiffStart", {
            enumerable: !0,
            get: function() {
                return _diff.findDiffStart
            }
        }),
        Object.defineProperty(exports, "findDiffEnd", {
            enumerable: !0,
            get: function() {
                return _diff.findDiffEnd
            }
        })
    }
    , {
        "./defaultschema": 31,
        "./diff": 32,
        "./fragment": 33,
        "./mark": 35,
        "./node": 36,
        "./replace": 37,
        "./resolvedpos": 38,
        "./schema": 39
    }],
    35: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var empty = (exports.Mark = function() {
            function Mark(type, attrs) {
                _classCallCheck(this, Mark),
                this.type = type,
                this.attrs = attrs
            }
            return _createClass(Mark, [{
                key: "toJSON",
                value: function() {
                    var obj = {
                        _: this.type.name
                    };
                    for (var attr in this.attrs)
                        obj[attr] = this.attrs[attr];
                    return obj
                }
            }, {
                key: "addToSet",
                value: function(set) {
                    for (var i = 0; i < set.length; i++) {
                        var other = set[i];
                        if (other.type == this.type) {
                            if (this.eq(other))
                                return set;
                            var copy = set.slice();
                            return copy[i] = this,
                            copy
                        }
                        if (other.type.rank > this.type.rank)
                            return set.slice(0, i).concat(this).concat(set.slice(i))
                    }
                    return set.concat(this)
                }
            }, {
                key: "removeFromSet",
                value: function(set) {
                    for (var i = 0; i < set.length; i++)
                        if (this.eq(set[i]))
                            return set.slice(0, i).concat(set.slice(i + 1));
                    return set
                }
            }, {
                key: "isInSet",
                value: function(set) {
                    for (var i = 0; i < set.length; i++)
                        if (this.eq(set[i]))
                            return !0;
                    return !1
                }
            }, {
                key: "eq",
                value: function(other) {
                    if (this == other)
                        return !0;
                    if (this.type != other.type)
                        return !1;
                    for (var attr in this.attrs)
                        if (other.attrs[attr] != this.attrs[attr])
                            return !1;
                    return !0
                }
            }], [{
                key: "sameSet",
                value: function(a, b) {
                    if (a == b)
                        return !0;
                    if (a.length != b.length)
                        return !1;
                    for (var i = 0; i < a.length; i++)
                        if (!a[i].eq(b[i]))
                            return !1;
                    return !0
                }
            }, {
                key: "setFrom",
                value: function(marks) {
                    if (!marks || 0 == marks.length)
                        return empty;
                    if (marks instanceof Mark)
                        return [marks];
                    var copy = marks.slice();
                    return copy.sort(function(a, b) {
                        return a.type.rank - b.type.rank
                    }),
                    copy
                }
            }]),
            Mark
        }(),
        [])
    }
    , {}],
    36: [function(require, module, exports) {
        "use strict";
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function wrapMarks(marks, str) {
            for (var i = marks.length - 1; i >= 0; i--)
                str = marks[i].type.name + "(" + str + ")";
            return str
        }
        var _get = function get(object, property, receiver) {
            null === object && (object = Function.prototype);
            var desc = Object.getOwnPropertyDescriptor(object, property);
            if (void 0 === desc) {
                var parent = Object.getPrototypeOf(object);
                return null === parent ? void 0 : get(parent, property, receiver)
            }
            if ("value"in desc)
                return desc.value;
            var getter = desc.get;
            if (void 0 !== getter)
                return getter.call(receiver)
        }
          , _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.TextNode = exports.Node = void 0;
        var _fragment = require("./fragment")
          , _mark = require("./mark")
          , _replace2 = require("./replace")
          , _resolvedpos = require("./resolvedpos")
          , emptyArray = []
          , emptyAttrs = Object.create(null)
          , Node = exports.Node = function() {
            function Node(type, attrs, content, marks) {
                _classCallCheck(this, Node),
                this.type = type,
                this.attrs = attrs,
                this.content = content || _fragment.Fragment.empty,
                this.marks = marks || emptyArray
            }
            return _createClass(Node, [{
                key: "child",
                value: function(index) {
                    return this.content.child(index)
                }
            }, {
                key: "maybeChild",
                value: function(index) {
                    return this.content.maybeChild(index)
                }
            }, {
                key: "forEach",
                value: function(f) {
                    this.content.forEach(f)
                }
            }, {
                key: "eq",
                value: function(other) {
                    return this == other || this.sameMarkup(other) && this.content.eq(other.content)
                }
            }, {
                key: "sameMarkup",
                value: function(other) {
                    return this.hasMarkup(other.type, other.attrs, other.marks)
                }
            }, {
                key: "hasMarkup",
                value: function(type, attrs, marks) {
                    return this.type == type && Node.sameAttrs(this.attrs, attrs || emptyAttrs) && _mark.Mark.sameSet(this.marks, marks || emptyArray)
                }
            }, {
                key: "copy",
                value: function() {
                    var content = arguments.length <= 0 || void 0 === arguments[0] ? null : arguments[0];
                    return content == this.content ? this : new this.constructor(this.type,this.attrs,content,this.marks)
                }
            }, {
                key: "mark",
                value: function(marks) {
                    return new this.constructor(this.type,this.attrs,this.content,marks)
                }
            }, {
                key: "cut",
                value: function(from, to) {
                    return 0 == from && to == this.content.size ? this : this.copy(this.content.cut(from, to))
                }
            }, {
                key: "slice",
                value: function(from) {
                    var to = arguments.length <= 1 || void 0 === arguments[1] ? this.content.size : arguments[1];
                    if (from == to)
                        return _replace2.Slice.empty;
                    var $from = this.resolve(from)
                      , $to = this.resolve(to)
                      , depth = $from.sameDepth($to)
                      , start = $from.start(depth)
                      , node = $from.node(depth)
                      , content = node.content.cut($from.pos - start, $to.pos - start);
                    return new _replace2.Slice(content,$from.depth - depth,$to.depth - depth,node)
                }
            }, {
                key: "replace",
                value: function(from, to, slice) {
                    return (0,
                    _replace2.replace)(this.resolve(from), this.resolve(to), slice)
                }
            }, {
                key: "nodeAt",
                value: function(pos) {
                    for (var node = this; ; ) {
                        var _node$content$findInd = node.content.findIndex(pos)
                          , index = _node$content$findInd.index
                          , offset = _node$content$findInd.offset;
                        if (node = node.maybeChild(index),
                        !node)
                            return null;
                        if (offset == pos || node.isText)
                            return node;
                        pos -= offset + 1
                    }
                }
            }, {
                key: "childAfter",
                value: function(pos) {
                    var _content$findIndex = this.content.findIndex(pos)
                      , index = _content$findIndex.index
                      , offset = _content$findIndex.offset;
                    return {
                        node: this.content.maybeChild(index),
                        index: index,
                        offset: offset
                    }
                }
            }, {
                key: "childBefore",
                value: function(pos) {
                    if (0 == pos)
                        return {
                            node: null,
                            index: 0,
                            offset: 0
                        };
                    var _content$findIndex2 = this.content.findIndex(pos)
                      , index = _content$findIndex2.index
                      , offset = _content$findIndex2.offset;
                    if (pos > offset)
                        return {
                            node: this.content.child(index),
                            index: index,
                            offset: offset
                        };
                    var node = this.content.child(index - 1);
                    return {
                        node: node,
                        index: index - 1,
                        offset: offset - node.nodeSize
                    }
                }
            }, {
                key: "nodesBetween",
                value: function(from, to, f) {
                    var pos = arguments.length <= 3 || void 0 === arguments[3] ? 0 : arguments[3];
                    this.content.nodesBetween(from, to, f, pos, this)
                }
            }, {
                key: "descendants",
                value: function(f) {
                    this.nodesBetween(0, this.content.size, f)
                }
            }, {
                key: "resolve",
                value: function(pos) {
                    return _resolvedpos.ResolvedPos.resolveCached(this, pos)
                }
            }, {
                key: "resolveNoCache",
                value: function(pos) {
                    return _resolvedpos.ResolvedPos.resolve(this, pos)
                }
            }, {
                key: "marksAt",
                value: function(pos) {
                    var $pos = this.resolve(pos)
                      , parent = $pos.parent
                      , index = $pos.index($pos.depth);
                    if (0 == parent.content.size)
                        return emptyArray;
                    if (0 == index || !$pos.atNodeBoundary)
                        return parent.child(index).marks;
                    for (var marks = parent.child(index - 1).marks, i = 0; i < marks.length; i++)
                        marks[i].type.inclusiveRight || (marks = marks[i--].removeFromSet(marks));
                    return marks
                }
            }, {
                key: "rangeHasMark",
                value: function(from, to, type) {
                    var found = !1;
                    return this.nodesBetween(from, to, function(node) {
                        return type.isInSet(node.marks) && (found = !0),
                        !found
                    }),
                    found
                }
            }, {
                key: "toString",
                value: function() {
                    var name = this.type.name;
                    return this.content.size && (name += "(" + this.content.toStringInner() + ")"),
                    wrapMarks(this.marks, name)
                }
            }, {
                key: "toJSON",
                value: function() {
                    var obj = {
                        type: this.type.name
                    };
                    for (var _ in this.attrs) {
                        obj.attrs = this.attrs;
                        break
                    }
                    return this.content.size && (obj.content = this.content.toJSON()),
                    this.marks.length && (obj.marks = this.marks.map(function(n) {
                        return n.toJSON()
                    })),
                    obj
                }
            }, {
                key: "nodeSize",
                get: function() {
                    return this.type.contains ? 2 + this.content.size : 1
                }
            }, {
                key: "childCount",
                get: function() {
                    return this.content.childCount
                }
            }, {
                key: "textContent",
                get: function() {
                    return this.content.textContent
                }
            }, {
                key: "firstChild",
                get: function() {
                    return this.content.firstChild
                }
            }, {
                key: "lastChild",
                get: function() {
                    return this.content.lastChild
                }
            }, {
                key: "isBlock",
                get: function() {
                    return this.type.isBlock
                }
            }, {
                key: "isTextblock",
                get: function() {
                    return this.type.isTextblock
                }
            }, {
                key: "isInline",
                get: function() {
                    return this.type.isInline
                }
            }, {
                key: "isText",
                get: function() {
                    return this.type.isText
                }
            }, {
                key: "value",
                get: function() {
                    return this
                }
            }], [{
                key: "sameAttrs",
                value: function(a, b) {
                    if (a == b)
                        return !0;
                    for (var prop in a)
                        if (a[prop] !== b[prop])
                            return !1;
                    return !0
                }
            }, {
                key: "fromJSON",
                value: function(schema, json) {
                    var type = schema.nodeType(json.type)
                      , content = null != json.text ? json.text : _fragment.Fragment.fromJSON(schema, json.content);
                    return type.create(json.attrs, content, json.marks && json.marks.map(schema.markFromJSON))
                }
            }]),
            Node
        }();
        exports.TextNode = function(_Node) {
            function TextNode(type, attrs, content, marks) {
                _classCallCheck(this, TextNode);
                var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TextNode).call(this, type, attrs, null, marks));
                if (!content)
                    throw new RangeError("Empty text nodes are not allowed");
                return _this.text = content,
                _this
            }
            return _inherits(TextNode, _Node),
            _createClass(TextNode, [{
                key: "toString",
                value: function() {
                    return wrapMarks(this.marks, JSON.stringify(this.text))
                }
            }, {
                key: "mark",
                value: function(marks) {
                    return new TextNode(this.type,this.attrs,this.text,marks)
                }
            }, {
                key: "cut",
                value: function() {
                    var from = arguments.length <= 0 || void 0 === arguments[0] ? 0 : arguments[0]
                      , to = arguments.length <= 1 || void 0 === arguments[1] ? this.text.length : arguments[1];
                    return 0 == from && to == this.text.length ? this : this.copy(this.text.slice(from, to))
                }
            }, {
                key: "eq",
                value: function(other) {
                    return this.sameMarkup(other) && this.text == other.text
                }
            }, {
                key: "toJSON",
                value: function() {
                    var base = _get(Object.getPrototypeOf(TextNode.prototype), "toJSON", this).call(this);
                    return base.text = this.text,
                    base
                }
            }, {
                key: "textContent",
                get: function() {
                    return this.text
                }
            }, {
                key: "nodeSize",
                get: function() {
                    return this.text.length
                }
            }]),
            TextNode
        }(Node)
    }
    , {
        "./fragment": 33,
        "./mark": 35,
        "./replace": 37,
        "./resolvedpos": 38
    }],
    37: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function replace($from, $to, slice) {
            if (slice.openLeft > $from.depth)
                throw new ReplaceError("Inserted content deeper than insertion position");
            if ($from.depth - slice.openLeft != $to.depth - slice.openRight)
                throw new ReplaceError("Inconsistent open depths");
            return replaceOuter($from, $to, slice, 0)
        }
        function replaceOuter($from, $to, slice, depth) {
            var index = $from.index(depth)
              , node = $from.node(depth);
            if (index == $to.index(depth) && depth < $from.depth - slice.openLeft) {
                var inner = replaceOuter($from, $to, slice, depth + 1);
                return node.copy(node.content.replaceChild(index, inner))
            }
            if (slice.content.size) {
                var _prepareSliceForRepla = prepareSliceForReplace(slice, $from)
                  , start = _prepareSliceForRepla.start
                  , end = _prepareSliceForRepla.end;
                return close(node, replaceThreeWay($from, start, end, $to, depth))
            }
            return close(node, replaceTwoWay($from, $to, depth))
        }
        function checkJoin(main, sub) {
            if (!main.type.canContainContent(sub.type))
                throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main.type.name)
        }
        function joinable($before, $after, depth) {
            var node = $before.node(depth);
            return checkJoin(node, $after.node(depth)),
            node
        }
        function addNode(child, target) {
            var last = target.length - 1;
            last >= 0 && child.isText && child.sameMarkup(target[last]) ? target[last] = child.copy(target[last].text + child.text) : target.push(child)
        }
        function addRange($start, $end, depth, target) {
            var node = ($end || $start).node(depth)
              , startIndex = 0
              , endIndex = $end ? $end.index(depth) : node.childCount;
            $start && (startIndex = $start.index(depth),
            $start.depth > depth ? startIndex++ : $start.atNodeBoundary || (addNode($start.nodeAfter, target),
            startIndex++));
            for (var i = startIndex; endIndex > i; i++)
                addNode(node.child(i), target);
            $end && $end.depth == depth && !$end.atNodeBoundary && addNode($end.nodeBefore, target)
        }
        function close(node, content) {
            if (!node.type.checkContent(content, node.attrs))
                throw new ReplaceError("Invalid content for node " + node.type.name);
            return node.copy(content)
        }
        function replaceThreeWay($from, $start, $end, $to, depth) {
            var openLeft = $from.depth > depth && joinable($from, $start, depth + 1)
              , openRight = $to.depth > depth && joinable($end, $to, depth + 1)
              , content = [];
            return addRange(null, $from, depth, content),
            openLeft && openRight && $start.index(depth) == $end.index(depth) ? (checkJoin(openLeft, openRight),
            addNode(close(openLeft, replaceThreeWay($from, $start, $end, $to, depth + 1)), content)) : (openLeft && addNode(close(openLeft, replaceTwoWay($from, $start, depth + 1)), content),
            addRange($start, $end, depth, content),
            openRight && addNode(close(openRight, replaceTwoWay($end, $to, depth + 1)), content)),
            addRange($to, null, depth, content),
            new _fragment.Fragment(content)
        }
        function replaceTwoWay($from, $to, depth) {
            var content = [];
            if (addRange(null, $from, depth, content),
            $from.depth > depth) {
                var type = joinable($from, $to, depth + 1);
                addNode(close(type, replaceTwoWay($from, $to, depth + 1)), content)
            }
            return addRange($to, null, depth, content),
            new _fragment.Fragment(content)
        }
        function prepareSliceForReplace(slice, $along) {
            var extra = $along.depth - slice.openLeft
              , parent = $along.node(extra);
            if (!parent.type.canContainFragment(slice.content))
                throw new ReplaceError("Content " + slice.content + " cannot be placed in " + parent.type.name);
            for (var node = parent.copy(slice.content), i = extra - 1; i >= 0; i--)
                node = $along.node(i).copy(_fragment.Fragment.from(node));
            return {
                start: node.resolveNoCache(slice.openLeft + extra),
                end: node.resolveNoCache(node.content.size - slice.openRight - extra)
            }
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Slice = exports.ReplaceError = void 0,
        exports.replace = replace;
        var _error = require("../util/error")
          , _fragment = require("./fragment")
          , ReplaceError = exports.ReplaceError = function(_ProseMirrorError) {
            function ReplaceError() {
                return _classCallCheck(this, ReplaceError),
                _possibleConstructorReturn(this, Object.getPrototypeOf(ReplaceError).apply(this, arguments))
            }
            return _inherits(ReplaceError, _ProseMirrorError),
            ReplaceError
        }(_error.ProseMirrorError)
          , Slice = exports.Slice = function() {
            function Slice(content, openLeft, openRight, possibleParent) {
                _classCallCheck(this, Slice),
                this.content = content,
                this.openLeft = openLeft,
                this.openRight = openRight,
                this.possibleParent = possibleParent
            }
            return _createClass(Slice, [{
                key: "toJSON",
                value: function() {
                    return this.content.size ? {
                        content: this.content.toJSON(),
                        openLeft: this.openLeft,
                        openRight: this.openRight
                    } : null
                }
            }, {
                key: "size",
                get: function() {
                    return this.content.size - this.openLeft - this.openRight
                }
            }], [{
                key: "fromJSON",
                value: function(schema, json) {
                    return json ? new Slice(_fragment.Fragment.fromJSON(schema, json.content),json.openLeft,json.openRight) : Slice.empty
                }
            }]),
            Slice
        }();
        Slice.empty = new Slice(_fragment.Fragment.empty,0,0)
    }
    , {
        "../util/error": 52,
        "./fragment": 33
    }],
    38: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var resolveCache = (exports.ResolvedPos = function() {
            function ResolvedPos(pos, path, parentOffset) {
                _classCallCheck(this, ResolvedPos),
                this.pos = pos,
                this.path = path,
                this.depth = path.length / 3 - 1,
                this.parentOffset = parentOffset
            }
            return _createClass(ResolvedPos, [{
                key: "node",
                value: function(depth) {
                    return this.path[3 * depth]
                }
            }, {
                key: "index",
                value: function(depth) {
                    return this.path[3 * depth + 1]
                }
            }, {
                key: "start",
                value: function(depth) {
                    return 0 == depth ? 0 : this.path[3 * depth - 1] + 1
                }
            }, {
                key: "end",
                value: function(depth) {
                    return this.start(depth) + this.node(depth).content.size
                }
            }, {
                key: "before",
                value: function(depth) {
                    if (!depth)
                        throw new RangeError("There is no position before the top-level node");
                    return depth == this.depth + 1 ? this.pos : this.path[3 * depth - 1]
                }
            }, {
                key: "after",
                value: function(depth) {
                    if (!depth)
                        throw new RangeError("There is no position after the top-level node");
                    return depth == this.depth + 1 ? this.pos : this.path[3 * depth - 1] + this.path[3 * depth].nodeSize
                }
            }, {
                key: "sameDepth",
                value: function(other) {
                    for (var depth = 0, max = Math.min(this.depth, other.depth); max > depth && this.index(depth) == other.index(depth); )
                        ++depth;
                    return depth
                }
            }, {
                key: "sameParent",
                value: function(other) {
                    return this.pos - this.parentOffset == other.pos - other.parentOffset
                }
            }, {
                key: "toString",
                value: function() {
                    for (var str = "", i = 1; i <= this.depth; i++)
                        str += (str ? "/" : "") + this.node(i).type.name + "_" + this.index(i - 1);
                    return str + ":" + this.parentOffset
                }
            }, {
                key: "parent",
                get: function() {
                    return this.node(this.depth)
                }
            }, {
                key: "atNodeBoundary",
                get: function() {
                    return this.path[this.path.length - 1] == this.pos
                }
            }, {
                key: "nodeAfter",
                get: function() {
                    var parent = this.parent
                      , index = this.index(this.depth);
                    if (index == parent.childCount)
                        return null;
                    var dOff = this.pos - this.path[this.path.length - 1]
                      , child = parent.child(index);
                    return dOff ? parent.child(index).cut(dOff) : child
                }
            }, {
                key: "nodeBefore",
                get: function() {
                    var index = this.index(this.depth)
                      , dOff = this.pos - this.path[this.path.length - 1];
                    return dOff ? this.parent.child(index).cut(0, dOff) : 0 == index ? null : this.parent.child(index - 1)
                }
            }], [{
                key: "resolve",
                value: function(doc, pos) {
                    if (!(pos >= 0 && pos <= doc.content.size))
                        throw new RangeError("Position " + pos + " out of range");
                    for (var path = [], start = 0, parentOffset = pos, node = doc; ; ) {
                        var _node$content$findInd = node.content.findIndex(parentOffset)
                          , index = _node$content$findInd.index
                          , offset = _node$content$findInd.offset
                          , rem = parentOffset - offset;
                        if (path.push(node, index, start + offset),
                        !rem)
                            break;
                        if (node = node.child(index),
                        node.isText)
                            break;
                        parentOffset = rem - 1,
                        start += offset + 1
                    }
                    return new ResolvedPos(pos,path,parentOffset)
                }
            }, {
                key: "resolveCached",
                value: function(doc, pos) {
                    for (var i = 0; i < resolveCache.length; i++) {
                        var cached = resolveCache[i];
                        if (cached.pos == pos && cached.node(0) == doc)
                            return cached
                    }
                    var result = resolveCache[resolveCachePos] = ResolvedPos.resolve(doc, pos);
                    return resolveCachePos = (resolveCachePos + 1) % resolveCacheSize,
                    result
                }
            }]),
            ResolvedPos
        }(),
        [])
          , resolveCachePos = 0
          , resolveCacheSize = 6
    }
    , {}],
    39: [function(require, module, exports) {
        "use strict";
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function overlayObj(base, update) {
            var copy = (0,
            _obj.copyObj)(base);
            for (var name in update) {
                var value = update[name];
                null == value ? delete copy[name] : copy[name] = value
            }
            return copy
        }
        var _get = function get(object, property, receiver) {
            null === object && (object = Function.prototype);
            var desc = Object.getOwnPropertyDescriptor(object, property);
            if (void 0 === desc) {
                var parent = Object.getPrototypeOf(object);
                return null === parent ? void 0 : get(parent, property, receiver)
            }
            if ("value"in desc)
                return desc.value;
            var getter = desc.get;
            if (void 0 !== getter)
                return getter.call(receiver)
        }
          , _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Schema = exports.SchemaSpec = exports.MarkType = exports.Attribute = exports.Text = exports.Inline = exports.Textblock = exports.Block = exports.NodeKind = exports.NodeType = void 0;
        var _node = require("./node")
          , _fragment = require("./fragment")
          , _mark = require("./mark")
          , _obj = require("../util/obj")
          , SchemaItem = function() {
            function SchemaItem() {
                _classCallCheck(this, SchemaItem)
            }
            return _createClass(SchemaItem, [{
                key: "getDefaultAttrs",
                value: function() {
                    var defaults = Object.create(null);
                    for (var attrName in this.attrs) {
                        var attr = this.attrs[attrName];
                        if (null == attr["default"])
                            return null;
                        defaults[attrName] = attr["default"]
                    }
                    return defaults
                }
            }, {
                key: "computeAttrs",
                value: function(attrs, arg) {
                    var built = Object.create(null);
                    for (var name in this.attrs) {
                        var value = attrs && attrs[name];
                        if (null == value) {
                            var attr = this.attrs[name];
                            if (null != attr["default"])
                                value = attr["default"];
                            else {
                                if (!attr.compute)
                                    throw new RangeError("No value supplied for attribute " + name);
                                value = attr.compute(this, arg)
                            }
                        }
                        built[name] = value
                    }
                    return built
                }
            }, {
                key: "freezeAttrs",
                value: function() {
                    var frozen = Object.create(null);
                    for (var name in this.attrs)
                        frozen[name] = this.attrs[name];
                    Object.defineProperty(this, "attrs", {
                        value: frozen
                    })
                }
            }, {
                key: "attrs",
                get: function() {
                    return {}
                }
            }], [{
                key: "updateAttrs",
                value: function(attrs) {
                    Object.defineProperty(this.prototype, "attrs", {
                        value: overlayObj(this.prototype.attrs, attrs)
                    })
                }
            }, {
                key: "getRegistry",
                value: function() {
                    return this == SchemaItem ? null : (this.prototype.hasOwnProperty("registry") || (this.prototype.registry = Object.create(Object.getPrototypeOf(this).getRegistry())),
                    this.prototype.registry)
                }
            }, {
                key: "getNamespace",
                value: function(name) {
                    if (this == SchemaItem)
                        return null;
                    var reg = this.getRegistry();
                    return Object.prototype.hasOwnProperty.call(reg, name) || (reg[name] = Object.create(Object.getPrototypeOf(this).getNamespace(name))),
                    reg[name]
                }
            }, {
                key: "register",
                value: function(namespace, name, value) {
                    this.getNamespace(namespace)[name] = function() {
                        return value
                    }
                }
            }, {
                key: "registerComputed",
                value: function(namespace, name, f) {
                    this.getNamespace(namespace)[name] = f
                }
            }, {
                key: "cleanNamespace",
                value: function(namespace) {
                    this.getNamespace(namespace).__proto__ = null
                }
            }]),
            SchemaItem
        }()
          , NodeType = exports.NodeType = function(_SchemaItem) {
            function NodeType(name, schema) {
                _classCallCheck(this, NodeType);
                var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NodeType).call(this));
                return _this.name = name,
                _this.freezeAttrs(),
                _this.defaultAttrs = _this.getDefaultAttrs(),
                _this.schema = schema,
                _this
            }
            return _inherits(NodeType, _SchemaItem),
            _createClass(NodeType, [{
                key: "canContainFragment",
                value: function(fragment) {
                    for (var i = 0; i < fragment.childCount; i++)
                        if (!this.canContain(fragment.child(i)))
                            return !1;
                    return !0
                }
            }, {
                key: "canContain",
                value: function(node) {
                    if (!this.canContainType(node.type))
                        return !1;
                    for (var i = 0; i < node.marks.length; i++)
                        if (!this.canContainMark(node.marks[i]))
                            return !1;
                    return !0
                }
            }, {
                key: "canContainMark",
                value: function(mark) {
                    var contains = this.containsMarks;
                    if (contains === !0)
                        return !0;
                    if (contains)
                        for (var i = 0; i < contains.length; i++)
                            if (contains[i] == mark.name)
                                return !0;
                    return !1
                }
            }, {
                key: "canContainType",
                value: function(type) {
                    return type.kind && type.kind.isSubKind(this.contains)
                }
            }, {
                key: "canContainContent",
                value: function(type) {
                    return type.contains && type.contains.isSubKind(this.contains)
                }
            }, {
                key: "findConnection",
                value: function(other) {
                    return other.kind && this.findConnectionToKind(other.kind)
                }
            }, {
                key: "findConnectionToKind",
                value: function(kind) {
                    var cache = this.schema.cached.connections
                      , key = this.name + "-" + kind.id;
                    return key in cache ? cache[key] : cache[key] = this.findConnectionToKindInner(kind)
                }
            }, {
                key: "findConnectionToKindInner",
                value: function(kind) {
                    if (kind.isSubKind(this.contains))
                        return [];
                    for (var seen = Object.create(null), active = [{
                        from: this,
                        via: []
                    }]; active.length; ) {
                        var current = active.shift();
                        for (var name in this.schema.nodes) {
                            var type = this.schema.nodes[name];
                            if (type.contains && type.defaultAttrs && !(type.contains.id in seen) && current.from.canContainType(type)) {
                                var via = current.via.concat(type);
                                if (kind.isSubKind(type.contains))
                                    return via;
                                active.push({
                                    from: type,
                                    via: via
                                }),
                                seen[type.contains.id] = !0
                            }
                        }
                    }
                }
            }, {
                key: "computeAttrs",
                value: function(attrs, content) {
                    return !attrs && this.defaultAttrs ? this.defaultAttrs : _get(Object.getPrototypeOf(NodeType.prototype), "computeAttrs", this).call(this, attrs, content)
                }
            }, {
                key: "create",
                value: function(attrs, content, marks) {
                    return new _node.Node(this,this.computeAttrs(attrs, content),_fragment.Fragment.from(content),_mark.Mark.setFrom(marks))
                }
            }, {
                key: "checkContent",
                value: function(content, _attrs) {
                    if (0 == content.size)
                        return this.canBeEmpty;
                    for (var i = 0; i < content.childCount; i++)
                        if (!this.canContain(content.child(i)))
                            return !1;
                    return !0
                }
            }, {
                key: "fixContent",
                value: function(_content, _attrs) {
                    return this.defaultContent()
                }
            }, {
                key: "isBlock",
                get: function() {
                    return !1
                }
            }, {
                key: "isTextblock",
                get: function() {
                    return !1
                }
            }, {
                key: "isInline",
                get: function() {
                    return !1
                }
            }, {
                key: "isText",
                get: function() {
                    return !1
                }
            }, {
                key: "selectable",
                get: function() {
                    return !0
                }
            }, {
                key: "draggable",
                get: function() {
                    return !1
                }
            }, {
                key: "locked",
                get: function() {
                    return !1
                }
            }, {
                key: "contains",
                get: function() {
                    return null
                }
            }, {
                key: "kind",
                get: function() {
                    return null
                }
            }, {
                key: "canBeEmpty",
                get: function() {
                    return !0
                }
            }, {
                key: "containsMarks",
                get: function() {
                    return !1
                }
            }], [{
                key: "compile",
                value: function(types, schema) {
                    var result = Object.create(null);
                    for (var name in types)
                        result[name] = new types[name](name,schema);
                    if (!result.doc)
                        throw new RangeError("Every schema needs a 'doc' type");
                    if (!result.text)
                        throw new RangeError("Every schema needs a 'text' type");
                    return result
                }
            }]),
            NodeType
        }(SchemaItem)
          , NodeKind = exports.NodeKind = function() {
            function NodeKind(name, supers, subs) {
                var _this2 = this;
                _classCallCheck(this, NodeKind),
                this.name = name,
                this.id = ++NodeKind.nextID,
                this.supers = Object.create(null),
                this.supers[this.id] = this,
                this.subs = subs || [],
                supers && supers.forEach(function(sup) {
                    return _this2.addSuper(sup)
                }),
                subs && subs.forEach(function(sub) {
                    return _this2.addSub(sub)
                })
            }
            return _createClass(NodeKind, [{
                key: "sharedSuperKind",
                value: function(other) {
                    if (this.isSubKind(other))
                        return other;
                    if (other.isSubKind(this))
                        return this;
                    var found = void 0;
                    for (var id in this.supers) {
                        var shared = other.supers[id];
                        !shared || found && !shared.isSupKind(found) || (found = shared)
                    }
                    return found
                }
            }, {
                key: "addSuper",
                value: function(sup) {
                    for (var id in sup.supers)
                        this.supers[id] = sup.supers[id],
                        sup.subs.push(this)
                }
            }, {
                key: "addSub",
                value: function(sub) {
                    var _this3 = this;
                    if (this.supers[sub.id])
                        throw new RangeError("Circular subkind relation");
                    sub.supers[this.id] = !0,
                    sub.subs.forEach(function(next) {
                        return _this3.addSub(next)
                    })
                }
            }, {
                key: "isSubKind",
                value: function(other) {
                    return other && other.id in this.supers || !1
                }
            }]),
            NodeKind
        }();
        NodeKind.nextID = 0,
        NodeKind.block = new NodeKind("block"),
        NodeKind.inline = new NodeKind("inline"),
        NodeKind.text = new NodeKind("text",[NodeKind.inline]);
        var Block = exports.Block = function(_NodeType) {
            function Block() {
                return _classCallCheck(this, Block),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Block).apply(this, arguments))
            }
            return _inherits(Block, _NodeType),
            _createClass(Block, [{
                key: "defaultContent",
                value: function() {
                    var inner = this.schema.defaultTextblockType().create()
                      , conn = this.findConnection(inner.type);
                    if (!conn)
                        throw new RangeError("Can't create default content for " + this.name);
                    for (var i = conn.length - 1; i >= 0; i--)
                        inner = conn[i].create(null, inner);
                    return _fragment.Fragment.from(inner)
                }
            }, {
                key: "contains",
                get: function() {
                    return NodeKind.block
                }
            }, {
                key: "kind",
                get: function() {
                    return NodeKind.block
                }
            }, {
                key: "isBlock",
                get: function() {
                    return !0
                }
            }, {
                key: "canBeEmpty",
                get: function() {
                    return null == this.contains
                }
            }]),
            Block
        }(NodeType)
          , Inline = (exports.Textblock = function(_Block) {
            function Textblock() {
                return _classCallCheck(this, Textblock),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Textblock).apply(this, arguments))
            }
            return _inherits(Textblock, _Block),
            _createClass(Textblock, [{
                key: "contains",
                get: function() {
                    return NodeKind.inline
                }
            }, {
                key: "containsMarks",
                get: function() {
                    return !0
                }
            }, {
                key: "isTextblock",
                get: function() {
                    return !0
                }
            }, {
                key: "canBeEmpty",
                get: function() {
                    return !0
                }
            }]),
            Textblock
        }(Block),
        exports.Inline = function(_NodeType2) {
            function Inline() {
                return _classCallCheck(this, Inline),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Inline).apply(this, arguments))
            }
            return _inherits(Inline, _NodeType2),
            _createClass(Inline, [{
                key: "kind",
                get: function() {
                    return NodeKind.inline
                }
            }, {
                key: "isInline",
                get: function() {
                    return !0
                }
            }]),
            Inline
        }(NodeType))
          , MarkType = (exports.Text = function(_Inline) {
            function Text() {
                return _classCallCheck(this, Text),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Text).apply(this, arguments))
            }
            return _inherits(Text, _Inline),
            _createClass(Text, [{
                key: "create",
                value: function(attrs, content, marks) {
                    return new _node.TextNode(this,this.computeAttrs(attrs, content),content,marks)
                }
            }, {
                key: "selectable",
                get: function() {
                    return !1
                }
            }, {
                key: "isText",
                get: function() {
                    return !0
                }
            }, {
                key: "kind",
                get: function() {
                    return NodeKind.text
                }
            }]),
            Text
        }(Inline),
        exports.Attribute = function Attribute() {
            var options = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0];
            _classCallCheck(this, Attribute),
            this["default"] = options["default"],
            this.compute = options.compute,
            this.label = options.label
        }
        ,
        exports.MarkType = function(_SchemaItem2) {
            function MarkType(name, rank, schema) {
                _classCallCheck(this, MarkType);
                var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(MarkType).call(this));
                _this8.name = name,
                _this8.freezeAttrs(),
                _this8.rank = rank,
                _this8.schema = schema;
                var defaults = _this8.getDefaultAttrs();
                return _this8.instance = defaults && new _mark.Mark(_this8,defaults),
                _this8
            }
            return _inherits(MarkType, _SchemaItem2),
            _createClass(MarkType, [{
                key: "create",
                value: function(attrs) {
                    return !attrs && this.instance ? this.instance : new _mark.Mark(this,this.computeAttrs(attrs))
                }
            }, {
                key: "removeFromSet",
                value: function(set) {
                    for (var i = 0; i < set.length; i++)
                        if (set[i].type == this)
                            return set.slice(0, i).concat(set.slice(i + 1));
                    return set
                }
            }, {
                key: "isInSet",
                value: function(set) {
                    for (var i = 0; i < set.length; i++)
                        if (set[i].type == this)
                            return set[i]
                }
            }, {
                key: "inclusiveRight",
                get: function() {
                    return !0
                }
            }], [{
                key: "getOrder",
                value: function(marks) {
                    var sorted = [];
                    for (var name in marks)
                        sorted.push({
                            name: name,
                            rank: marks[name].rank
                        });
                    sorted.sort(function(a, b) {
                        return a.rank - b.rank
                    });
                    for (var ranks = Object.create(null), i = 0; i < sorted.length; i++)
                        ranks[sorted[i].name] = i;
                    return ranks
                }
            }, {
                key: "compile",
                value: function(marks, schema) {
                    var order = this.getOrder(marks)
                      , result = Object.create(null);
                    for (var name in marks)
                        result[name] = new marks[name](name,order[name],schema);
                    return result
                }
            }, {
                key: "rank",
                get: function() {
                    return 50
                }
            }]),
            MarkType
        }(SchemaItem))
          , Schema = (exports.SchemaSpec = function() {
            function SchemaSpec(nodes, marks) {
                _classCallCheck(this, SchemaSpec),
                this.nodes = nodes || {},
                this.marks = marks || {}
            }
            return _createClass(SchemaSpec, [{
                key: "update",
                value: function(nodes, marks) {
                    return new SchemaSpec(nodes ? overlayObj(this.nodes, nodes) : this.nodes,marks ? overlayObj(this.marks, marks) : this.marks)
                }
            }]),
            SchemaSpec
        }(),
        function() {
            function Schema(spec) {
                _classCallCheck(this, Schema),
                this.spec = spec,
                this.nodes = NodeType.compile(spec.nodes, this),
                this.marks = MarkType.compile(spec.marks, this);
                for (var prop in this.nodes)
                    if (prop in this.marks)
                        throw new RangeError(prop + " can not be both a node and a mark");
                this.cached = Object.create(null),
                this.cached.connections = Object.create(null),
                this.node = this.node.bind(this),
                this.text = this.text.bind(this),
                this.nodeFromJSON = this.nodeFromJSON.bind(this),
                this.markFromJSON = this.markFromJSON.bind(this)
            }
            return _createClass(Schema, [{
                key: "node",
                value: function(type, attrs, content, marks) {
                    if ("string" == typeof type)
                        type = this.nodeType(type);
                    else {
                        if (!(type instanceof NodeType))
                            throw new RangeError("Invalid node type: " + type);
                        if (type.schema != this)
                            throw new RangeError("Node type from different schema used (" + type.name + ")")
                    }
                    return type.create(attrs, content, marks)
                }
            }, {
                key: "text",
                value: function(_text, marks) {
                    return this.nodes.text.create(null, _text, _mark.Mark.setFrom(marks))
                }
            }, {
                key: "defaultTextblockType",
                value: function() {
                    var cached = this.cached.defaultTextblockType;
                    if (void 0 !== cached)
                        return cached;
                    for (var name in this.nodes)
                        if (this.nodes[name].defaultTextblock)
                            return this.cached.defaultTextblockType = this.nodes[name];
                    return this.cached.defaultTextblockType = null
                }
            }, {
                key: "mark",
                value: function(name, attrs) {
                    var spec = this.marks[name];
                    if (!spec)
                        throw new RangeError("No mark named " + name);
                    return spec.create(attrs)
                }
            }, {
                key: "nodeFromJSON",
                value: function(json) {
                    return _node.Node.fromJSON(this, json)
                }
            }, {
                key: "markFromJSON",
                value: function(json) {
                    var type = this.marks[json._]
                      , attrs = null;
                    for (var prop in json)
                        "_" != prop && (attrs || (attrs = Object.create(null)),
                        attrs[prop] = json[prop]);
                    return attrs ? type.create(attrs) : type.instance
                }
            }, {
                key: "nodeType",
                value: function(name) {
                    var found = this.nodes[name];
                    if (!found)
                        throw new RangeError("Unknown node type: " + name);
                    return found
                }
            }, {
                key: "registry",
                value: function registry(namespace, f) {
                    for (var i = 0; 2 > i; i++) {
                        var obj = i ? this.marks : this.nodes;
                        for (var tname in obj) {
                            var type = obj[tname]
                              , registry = type.registry
                              , ns = registry && registry[namespace];
                            if (ns)
                                for (var prop in ns) {
                                    var value = ns[prop](type);
                                    null != value && f(prop, value, type, tname)
                                }
                        }
                    }
                }
            }]),
            Schema
        }());
        exports.Schema = Schema
    }
    , {
        "../util/obj": 55,
        "./fragment": 33,
        "./mark": 35,
        "./node": 36
    }],
    40: [function(require, module, exports) {
        "use strict";
        function isFlatRange($from, $to) {
            if ($from.depth != $to.depth)
                return !1;
            for (var i = 0; i < $from.depth; i++)
                if ($from.index(i) != $to.index(i))
                    return !1;
            return $from.parentOffset <= $to.parentOffset
        }
        function canLift(doc, from, to) {
            return !!findLiftable(doc.resolve(from), doc.resolve(null == to ? from : to))
        }
        function rangeDepth(from, to) {
            var shared = from.sameDepth(to);
            return from.node(shared).isTextblock && --shared,
            shared && from.before(shared) >= to.after(shared) ? null : shared
        }
        function findLiftable(from, to) {
            var shared = rangeDepth(from, to);
            if (null == shared)
                return null;
            for (var parent = from.node(shared), depth = shared - 1; depth >= 0; --depth)
                if (from.node(depth).type.canContainContent(parent.type))
                    return {
                        depth: depth,
                        shared: shared,
                        unwrap: !1
                    };
            if (parent.isBlock)
                for (var depth = shared - 1; depth >= 0; --depth) {
                    for (var target = from.node(depth), i = from.index(shared), e = Math.min(to.index(shared) + 1, parent.childCount); e > i; i++)
                        target.type.canContainContent(parent.child(i).type);
                    return {
                        depth: depth,
                        shared: shared,
                        unwrap: !0
                    }
                }
        }
        function canWrap(doc, from, to, type) {
            return !!checkWrap(doc.resolve(from), doc.resolve(null == to ? from : to), type)
        }
        function checkWrap($from, $to, type) {
            var shared = rangeDepth($from, $to);
            if (null == shared)
                return null;
            var parent = $from.node(shared)
              , around = parent.type.findConnection(type)
              , inside = type.findConnection(parent.child($from.index(shared)).type);
            return around && inside ? {
                shared: shared,
                around: around,
                inside: inside
            } : void 0
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.canLift = canLift,
        exports.canWrap = canWrap;
        var _model = require("../model")
          , _transform = require("./transform")
          , _step = require("./step")
          , _map = require("./map");
        _step.Step.define("ancestor", {
            apply: function(doc, step) {
                var $from = doc.resolve(step.from)
                  , $to = doc.resolve(step.to);
                if (!isFlatRange($from, $to))
                    return _step.StepResult.fail("Not a flat range");
                var _step$param = step.param
                  , _step$param$depth = _step$param.depth
                  , depth = void 0 === _step$param$depth ? 0 : _step$param$depth
                  , _step$param$types = _step$param.types
                  , types = void 0 === _step$param$types ? [] : _step$param$types
                  , _step$param$attrs = _step$param.attrs
                  , attrs = void 0 === _step$param$attrs ? [] : _step$param$attrs;
                if (0 == depth && 0 == types.length)
                    return _step.StepResult.ok(doc);
                for (var i = 0, d = $from.depth; depth > i; i++,
                d--)
                    if ($from.start(d) != $from.pos - i || $to.end(d) != $to.pos + i)
                        return _step.StepResult.fail("Parent at depth " + d + " not fully covered");
                var inner = $from.parent
                  , slice = void 0;
                if (types.length) {
                    var lastWrapper = types[types.length - 1];
                    if (!lastWrapper.contains)
                        throw new RangeError("Can not wrap content in node type " + lastWrapper.name);
                    var content = inner.content.cut($from.parentOffset, $to.parentOffset);
                    if (!lastWrapper.checkContent(content, attrs[types.length - 1]))
                        return _step.StepResult.fail("Content can not be wrapped in ancestor " + lastWrapper.name);
                    for (var i = types.length - 1; i >= 0; i--)
                        content = _model.Fragment.from(types[i].create(attrs[i], content));
                    slice = new _model.Slice(content,0,0)
                } else
                    slice = new _model.Slice(inner.content,0,0);
                return _step.StepResult.fromReplace(doc, $from.pos - depth, $to.pos + depth, slice)
            },
            posMap: function(step) {
                var depth = step.param.depth || 0
                  , newDepth = step.param.types ? step.param.types.length : 0;
                return depth == newDepth && 2 > depth ? _map.PosMap.empty : new _map.PosMap([step.from - depth, depth, newDepth, step.to, depth, newDepth])
            },
            invert: function(step, oldDoc) {
                for (var types = [], attrs = [], $from = oldDoc.resolve(step.from), oldDepth = step.param.depth || 0, newDepth = step.param.types ? step.param.types.length : 0, i = 0; oldDepth > i; i++) {
                    var parent = $from.node($from.depth - i);
                    types.unshift(parent.type),
                    attrs.unshift(parent.attrs)
                }
                var dDepth = newDepth - oldDepth;
                return new _step.Step("ancestor",step.from + dDepth,step.to + dDepth,{
                    depth: newDepth,
                    types: types,
                    attrs: attrs
                })
            },
            paramToJSON: function(param) {
                return {
                    depth: param.depth,
                    types: param.types && param.types.map(function(t) {
                        return t.name
                    }),
                    attrs: param.attrs
                }
            },
            paramFromJSON: function(schema, json) {
                return {
                    depth: json.depth,
                    types: json.types && json.types.map(function(n) {
                        return schema.nodeType(n)
                    }),
                    attrs: json.attrs
                }
            }
        }),
        _transform.Transform.prototype.lift = function(from) {
            var to = arguments.length <= 1 || void 0 === arguments[1] ? from : arguments[1]
              , silent = arguments.length <= 2 || void 0 === arguments[2] ? !1 : arguments[2]
              , $from = this.doc.resolve(from)
              , $to = this.doc.resolve(to)
              , liftable = findLiftable($from, $to);
            if (!liftable) {
                if (!silent)
                    throw new RangeError("No valid lift target");
                return this
            }
            for (var depth = liftable.depth, shared = liftable.shared, unwrap = liftable.unwrap, start = $from.before(shared + 1), end = $to.after(shared + 1), d = shared; d > depth; d--)
                if ($to.index(d) + 1 < $to.node(d).childCount) {
                    this.split($to.after(d + 1), d - depth);
                    break
                }
            for (var d = shared; d > depth; d--)
                if ($from.index(d) > 0) {
                    var cut = d - depth;
                    this.split($from.before(d + 1), cut),
                    start += 2 * cut,
                    end += 2 * cut;
                    break
                }
            if (unwrap) {
                for (var joinPos = start, parent = $from.node(shared), i = $from.index(shared), e = $to.index(shared) + 1, first = !0; e > i; i++,
                first = !1)
                    first || (this.join(joinPos),
                    end -= 2),
                    joinPos += parent.child(i).nodeSize - (first ? 0 : 2);
                shared++,
                start++,
                end--
            }
            return this.step("ancestor", start, end, {
                depth: shared - depth
            })
        }
        ,
        _transform.Transform.prototype.wrap = function(from) {
            var to = arguments.length <= 1 || void 0 === arguments[1] ? from : arguments[1]
              , type = arguments[2]
              , wrapAttrs = arguments[3]
              , $from = this.doc.resolve(from)
              , $to = this.doc.resolve(to)
              , check = checkWrap($from, $to, type);
            if (!check)
                throw new RangeError("Wrap not possible");
            var shared = check.shared
              , around = check.around
              , inside = check.inside
              , types = around.concat(type).concat(inside)
              , attrs = around.map(function() {
                return null
            }).concat(wrapAttrs).concat(inside.map(function() {
                return null
            }))
              , start = $from.before(shared + 1);
            if (this.step("ancestor", start, $to.after(shared + 1), {
                types: types,
                attrs: attrs
            }),
            inside.length)
                for (var splitPos = start + types.length, parent = $from.node(shared), i = $from.index(shared), e = $to.index(shared) + 1, first = !0; e > i; i++,
                first = !1)
                    first || this.split(splitPos, inside.length),
                    splitPos += parent.child(i).nodeSize + (first ? 0 : 2 * inside.length);
            return this
        }
        ,
        _transform.Transform.prototype.setBlockType = function(from) {
            var to = arguments.length <= 1 || void 0 === arguments[1] ? from : arguments[1]
              , _this = this
              , type = arguments[2]
              , attrs = arguments[3];
            if (!type.isTextblock)
                throw new RangeError("Type given to setBlockType should be a textblock");
            return this.doc.nodesBetween(from, to, function(node, pos) {
                if (node.isTextblock && !node.hasMarkup(type, attrs)) {
                    var start = pos + 1
                      , end = start + node.content.size;
                    return _this.clearMarkup(start, end, type),
                    _this.step("ancestor", start, end, {
                        depth: 1,
                        types: [type],
                        attrs: [attrs]
                    }),
                    !1
                }
            }),
            this
        }
        ,
        _transform.Transform.prototype.setNodeType = function(pos, type, attrs) {
            var node = this.doc.nodeAt(pos);
            if (!node)
                throw new RangeError("No node at given position");
            return type || (type = node.type),
            node.type.contains ? this.step("ancestor", pos + 1, pos + 1 + node.content.size, {
                depth: 1,
                types: [type],
                attrs: [attrs]
            }) : this.replaceWith(pos, pos + node.nodeSize, type.create(attrs, null, node.marks))
        }
    }
    , {
        "../model": 34,
        "./map": 43,
        "./step": 47,
        "./transform": 48
    }],
    41: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Remapping = exports.MapResult = exports.PosMap = exports.joinable = exports.joinPoint = exports.canWrap = exports.canLift = exports.StepResult = exports.Step = exports.TransformError = exports.Transform = void 0;
        var _transform = require("./transform");
        Object.defineProperty(exports, "Transform", {
            enumerable: !0,
            get: function() {
                return _transform.Transform
            }
        }),
        Object.defineProperty(exports, "TransformError", {
            enumerable: !0,
            get: function() {
                return _transform.TransformError
            }
        });
        var _step = require("./step");
        Object.defineProperty(exports, "Step", {
            enumerable: !0,
            get: function() {
                return _step.Step
            }
        }),
        Object.defineProperty(exports, "StepResult", {
            enumerable: !0,
            get: function() {
                return _step.StepResult
            }
        });
        var _ancestor = require("./ancestor");
        Object.defineProperty(exports, "canLift", {
            enumerable: !0,
            get: function() {
                return _ancestor.canLift
            }
        }),
        Object.defineProperty(exports, "canWrap", {
            enumerable: !0,
            get: function() {
                return _ancestor.canWrap
            }
        });
        var _join = require("./join");
        Object.defineProperty(exports, "joinPoint", {
            enumerable: !0,
            get: function() {
                return _join.joinPoint
            }
        }),
        Object.defineProperty(exports, "joinable", {
            enumerable: !0,
            get: function() {
                return _join.joinable
            }
        });
        var _map = require("./map");
        Object.defineProperty(exports, "PosMap", {
            enumerable: !0,
            get: function() {
                return _map.PosMap
            }
        }),
        Object.defineProperty(exports, "MapResult", {
            enumerable: !0,
            get: function() {
                return _map.MapResult
            }
        }),
        Object.defineProperty(exports, "Remapping", {
            enumerable: !0,
            get: function() {
                return _map.Remapping
            }
        }),
        require("./mark"),
        require("./split"),
        require("./replace")
    }
    , {
        "./ancestor": 40,
        "./join": 42,
        "./map": 43,
        "./mark": 44,
        "./replace": 45,
        "./split": 46,
        "./step": 47,
        "./transform": 48
    }],
    42: [function(require, module, exports) {
        "use strict";
        function joinable(doc, pos) {
            var $pos = doc.resolve(pos);
            return canJoin($pos.nodeBefore, $pos.nodeAfter)
        }
        function canJoin(a, b) {
            return a && b && !a.isText && a.type.contains && a.type.canContainContent(b.type)
        }
        function joinPoint(doc, pos) {
            for (var dir = arguments.length <= 2 || void 0 === arguments[2] ? -1 : arguments[2], $pos = doc.resolve(pos), d = $pos.depth; ; d--) {
                var before = void 0
                  , after = void 0;
                if (d == $pos.depth ? (before = $pos.nodeBefore,
                after = $pos.nodeAfter) : dir > 0 ? (before = $pos.node(d + 1),
                after = $pos.node(d).maybeChild($pos.index(d) + 1)) : (before = $pos.node(d).maybeChild($pos.index(d) - 1),
                after = $pos.node(d + 1)),
                before && !before.isTextblock && canJoin(before, after))
                    return pos;
                if (0 == d)
                    break;
                pos = 0 > dir ? $pos.before(d) : $pos.after(d)
            }
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.joinable = joinable,
        exports.joinPoint = joinPoint;
        var _model = require("../model")
          , _transform = require("./transform")
          , _step = require("./step")
          , _map = require("./map");
        _step.Step.define("join", {
            apply: function(doc, step) {
                var $from = doc.resolve(step.from)
                  , $to = doc.resolve(step.to);
                return $from.parentOffset < $from.parent.content.size || $to.parentOffset > 0 || $to.pos - $from.pos != 2 ? _step.StepResult.fail("Join positions not around a split") : _step.StepResult.fromReplace(doc, $from.pos, $to.pos, _model.Slice.empty)
            },
            posMap: function(step) {
                return new _map.PosMap([step.from, 2, 0])
            },
            invert: function(step, doc) {
                var $before = doc.resolve(step.from)
                  , d1 = $before.depth - 1
                  , parentAfter = $before.node(d1).child($before.index(d1) + 1)
                  , param = null;
                return $before.parent.sameMarkup(parentAfter) || (param = {
                    type: parentAfter.type,
                    attrs: parentAfter.attrs
                }),
                new _step.Step("split",step.from,step.from,param)
            }
        }),
        _transform.Transform.prototype.join = function(pos) {
            for (var depth = arguments.length <= 1 || void 0 === arguments[1] ? 1 : arguments[1], silent = arguments.length <= 2 || void 0 === arguments[2] ? !1 : arguments[2], i = 0; depth > i; i++) {
                var $pos = this.doc.resolve(pos);
                if (0 == $pos.parentOffset || $pos.parentOffset == $pos.parent.content.size || !$pos.nodeBefore.type.canContainContent($pos.nodeAfter.type)) {
                    if (!silent)
                        throw new RangeError("Nothing to join at " + pos);
                    break
                }
                this.step("join", pos - 1, pos + 1),
                pos--
            }
            return this
        }
    }
    , {
        "../model": 34,
        "./map": 43,
        "./step": 47,
        "./transform": 48
    }],
    43: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function makeRecover(index, offset) {
            return index + offset * factor16
        }
        function recoverIndex(value) {
            return value & lower16
        }
        function recoverOffset(value) {
            return (value - (value & lower16)) / factor16
        }
        function mapThrough(mappables, pos, bias) {
            for (var i = 0; i < mappables.length; i++)
                pos = mappables[i].map(pos, bias);
            return pos
        }
        function mapThroughResult(mappables, pos, bias) {
            for (var deleted = !1, i = 0; i < mappables.length; i++) {
                var result = mappables[i].mapResult(pos, bias);
                pos = result.pos,
                result.deleted && (deleted = !0)
            }
            return new MapResult(pos,deleted)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.mapThrough = mapThrough,
        exports.mapThroughResult = mapThroughResult;
        var lower16 = 65535
          , factor16 = Math.pow(2, 16)
          , MapResult = exports.MapResult = function MapResult(pos) {
            var deleted = arguments.length <= 1 || void 0 === arguments[1] ? !1 : arguments[1]
              , recover = arguments.length <= 2 || void 0 === arguments[2] ? null : arguments[2];
            _classCallCheck(this, MapResult),
            this.pos = pos,
            this.deleted = deleted,
            this.recover = recover
        }
          , PosMap = exports.PosMap = function() {
            function PosMap(ranges) {
                var inverted = arguments.length <= 1 || void 0 === arguments[1] ? !1 : arguments[1];
                _classCallCheck(this, PosMap),
                this.ranges = ranges,
                this.inverted = inverted
            }
            return _createClass(PosMap, [{
                key: "recover",
                value: function(value) {
                    var diff = 0
                      , index = recoverIndex(value);
                    if (!this.inverted)
                        for (var i = 0; index > i; i++)
                            diff += this.ranges[3 * i + 2] - this.ranges[3 * i + 1];
                    return this.ranges[3 * index] + diff + recoverOffset(value)
                }
            }, {
                key: "mapResult",
                value: function(pos, bias) {
                    return this._map(pos, bias, !1)
                }
            }, {
                key: "map",
                value: function(pos, bias) {
                    return this._map(pos, bias, !0)
                }
            }, {
                key: "_map",
                value: function(pos, bias, simple) {
                    for (var diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2, i = 0; i < this.ranges.length; i += 3) {
                        var start = this.ranges[i] - (this.inverted ? diff : 0);
                        if (start > pos)
                            break;
                        var oldSize = this.ranges[i + oldIndex]
                          , newSize = this.ranges[i + newIndex]
                          , end = start + oldSize;
                        if (end >= pos) {
                            var side = oldSize ? pos == start ? -1 : pos == end ? 1 : bias : bias
                              , result = start + diff + (0 > side ? 0 : newSize);
                            if (simple)
                                return result;
                            var recover = makeRecover(i / 3, pos - start);
                            return new MapResult(result,pos != start && pos != end,recover)
                        }
                        diff += newSize - oldSize
                    }
                    return simple ? pos + diff : new MapResult(pos + diff)
                }
            }, {
                key: "touches",
                value: function(pos, recover) {
                    for (var diff = 0, index = recoverIndex(recover), oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2, i = 0; i < this.ranges.length; i += 3) {
                        var start = this.ranges[i] - (this.inverted ? diff : 0);
                        if (start > pos)
                            break;
                        var oldSize = this.ranges[i + oldIndex]
                          , end = start + oldSize;
                        if (end >= pos && i == 3 * index)
                            return !0;
                        diff += this.ranges[i + newIndex] - oldSize
                    }
                    return !1
                }
            }, {
                key: "invert",
                value: function() {
                    return new PosMap(this.ranges,!this.inverted)
                }
            }, {
                key: "toString",
                value: function() {
                    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges)
                }
            }]),
            PosMap
        }();
        PosMap.empty = new PosMap([]);
        exports.Remapping = function() {
            function Remapping() {
                var head = arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0]
                  , tail = arguments.length <= 1 || void 0 === arguments[1] ? [] : arguments[1];
                _classCallCheck(this, Remapping),
                this.head = head,
                this.tail = tail,
                this.mirror = Object.create(null)
            }
            return _createClass(Remapping, [{
                key: "addToFront",
                value: function(map, corr) {
                    this.head.push(map);
                    var id = -this.head.length;
                    return null != corr && (this.mirror[id] = corr),
                    id
                }
            }, {
                key: "addToBack",
                value: function(map, corr) {
                    this.tail.push(map);
                    var id = this.tail.length - 1;
                    return null != corr && (this.mirror[corr] = id),
                    id
                }
            }, {
                key: "get",
                value: function(id) {
                    return 0 > id ? this.head[-id - 1] : this.tail[id]
                }
            }, {
                key: "mapResult",
                value: function(pos, bias) {
                    return this._map(pos, bias, !1)
                }
            }, {
                key: "map",
                value: function(pos, bias) {
                    return this._map(pos, bias, !0)
                }
            }, {
                key: "_map",
                value: function(pos, bias, simple) {
                    for (var deleted = !1, recoverables = null, i = -this.head.length; i < this.tail.length; i++) {
                        var map = this.get(i)
                          , rec = void 0;
                        if (null != (rec = recoverables && recoverables[i]) && map.touches(pos, rec))
                            pos = map.recover(rec);
                        else {
                            var result = map.mapResult(pos, bias);
                            if (null != result.recover) {
                                var corr = this.mirror[i];
                                if (null != corr) {
                                    if (result.deleted) {
                                        i = corr,
                                        pos = this.get(corr).recover(result.recover);
                                        continue
                                    }
                                    (recoverables || (recoverables = Object.create(null)))[corr] = result.recover
                                }
                            }
                            result.deleted && (deleted = !0),
                            pos = result.pos
                        }
                    }
                    return simple ? pos : new MapResult(pos,deleted)
                }
            }, {
                key: "toString",
                value: function() {
                    for (var maps = [], i = -this.head.length; i < this.tail.length; i++)
                        maps.push(i + ":" + this.get(i) + (null != this.mirror[i] ? "->" + this.mirror[i] : ""));
                    return maps.join("\n")
                }
            }]),
            Remapping
        }()
    }
    , {}],
    44: [function(require, module, exports) {
        "use strict";
        function mapNode(node, f, parent) {
            return node.content.size && (node = node.copy(mapFragment(node.content, f, node))),
            node.isInline && (node = f(node, parent)),
            node
        }
        function mapFragment(fragment, f, parent) {
            for (var mapped = [], i = 0; i < fragment.childCount; i++)
                mapped.push(mapNode(fragment.child(i), f, parent));
            return _model.Fragment.fromArray(mapped)
        }
        var _model = require("../model")
          , _transform = require("./transform")
          , _step = require("./step");
        _step.Step.define("addMark", {
            apply: function(doc, step) {
                var slice = doc.slice(step.from, step.to)
                  , $pos = doc.resolve(step.from);
                return slice.content = mapFragment(slice.content, function(node, parent) {
                    return parent.type.canContainMark(step.param.type) ? node.mark(step.param.addToSet(node.marks)) : node
                }, $pos.node($pos.depth - slice.openLeft)),
                _step.StepResult.fromReplace(doc, step.from, step.to, slice)
            },
            invert: function(step) {
                return new _step.Step("removeMark",step.from,step.to,step.param)
            },
            paramToJSON: function(param) {
                return param.toJSON()
            },
            paramFromJSON: function(schema, json) {
                return schema.markFromJSON(json)
            }
        }),
        _transform.Transform.prototype.addMark = function(from, to, mark) {
            var _this = this
              , removed = []
              , added = []
              , removing = null
              , adding = null;
            return this.doc.nodesBetween(from, to, function(node, pos, parent) {
                if (node.isInline) {
                    var marks = node.marks;
                    if (mark.isInSet(marks) || !parent.type.canContainMark(mark.type))
                        adding = removing = null;
                    else {
                        var start = Math.max(pos, from)
                          , end = Math.min(pos + node.nodeSize, to)
                          , rm = mark.type.isInSet(marks);
                        rm ? removing && removing.param.eq(rm) ? removing.to = end : removed.push(removing = new _step.Step("removeMark",start,end,rm)) : removing = null,
                        adding ? adding.to = end : added.push(adding = new _step.Step("addMark",start,end,mark))
                    }
                }
            }),
            removed.forEach(function(s) {
                return _this.step(s)
            }),
            added.forEach(function(s) {
                return _this.step(s)
            }),
            this
        }
        ,
        _step.Step.define("removeMark", {
            apply: function(doc, step) {
                var slice = doc.slice(step.from, step.to);
                return slice.content = mapFragment(slice.content, function(node) {
                    return node.mark(step.param.removeFromSet(node.marks))
                }),
                _step.StepResult.fromReplace(doc, step.from, step.to, slice)
            },
            invert: function(step) {
                return new _step.Step("addMark",step.from,step.to,step.param)
            },
            paramToJSON: function(param) {
                return param.toJSON()
            },
            paramFromJSON: function(schema, json) {
                return schema.markFromJSON(json)
            }
        }),
        _transform.Transform.prototype.removeMark = function(from, to) {
            var _this2 = this
              , mark = arguments.length <= 2 || void 0 === arguments[2] ? null : arguments[2]
              , matched = []
              , step = 0;
            return this.doc.nodesBetween(from, to, function(node, pos) {
                if (node.isInline) {
                    step++;
                    var toRemove = null;
                    if (mark instanceof _model.MarkType) {
                        var found = mark.isInSet(node.marks);
                        found && (toRemove = [found])
                    } else
                        mark ? mark.isInSet(node.marks) && (toRemove = [mark]) : toRemove = node.marks;
                    if (toRemove && toRemove.length)
                        for (var end = Math.min(pos + node.nodeSize, to), i = 0; i < toRemove.length; i++) {
                            for (var style = toRemove[i], found = void 0, j = 0; j < matched.length; j++) {
                                var m = matched[j];
                                m.step == step - 1 && style.eq(matched[j].style) && (found = m)
                            }
                            found ? (found.to = end,
                            found.step = step) : matched.push({
                                style: style,
                                from: Math.max(pos, from),
                                to: end,
                                step: step
                            })
                        }
                }
            }),
            matched.forEach(function(m) {
                return _this2.step("removeMark", m.from, m.to, m.style)
            }),
            this
        }
        ,
        _transform.Transform.prototype.clearMarkup = function(from, to, newParent) {
            var _this3 = this
              , delSteps = [];
            this.doc.nodesBetween(from, to, function(node, pos) {
                if (node.isInline) {
                    if (newParent ? !newParent.canContainType(node.type) : !node.type.isText)
                        return void delSteps.push(new _step.Step("replace",pos,pos + node.nodeSize));
                    for (var i = 0; i < node.marks.length; i++) {
                        var mark = node.marks[i];
                        newParent && newParent.canContainMark(mark.type) || _this3.step("removeMark", Math.max(pos, from), Math.min(pos + node.nodeSize, to), mark)
                    }
                }
            });
            for (var i = delSteps.length - 1; i >= 0; i--)
                this.step(delSteps[i]);
            return this
        }
    }
    , {
        "../model": 34,
        "./step": 47,
        "./transform": 48
    }],
    45: [function(require, module, exports) {
        "use strict";
        function fitSliceInto($from, $to, slice) {
            var base = $from.sameDepth($to)
              , placed = placeSlice($from, slice)
              , outer = outerPlaced(placed);
            outer && (base = Math.min(outer.depth, base)),
            distAfter = -1e10;
            var fragment = closeFragment($from.node(base).type, fillBetween($from, $to, base, placed), $from, $to, base);
            return {
                fitted: new _model.Slice(fragment,$from.depth - base,$to.depth - base),
                distAfter: distAfter - ($to.depth - base)
            }
        }
        function outerPlaced(placed) {
            for (var i = 0; i < placed.length; i++)
                if (placed[i])
                    return placed[i]
        }
        function fillBetween($from, $to, depth, placed) {
            var fromNext = $from.depth > depth && $from.node(depth + 1)
              , toNext = $to.depth > depth && $to.node(depth + 1)
              , placedHere = placed[depth];
            if (fromNext && toNext && fromNext.type.canContainContent(toNext.type) && !placedHere)
                return _model.Fragment.from(closeNode(fromNext, fillBetween($from, $to, depth + 1, placed), $from, $to, depth + 1));
            var content = _model.Fragment.empty;
            return placedHere && (content = closeLeft(placedHere.content, placedHere.openLeft),
            placedHere.isEnd && (distAfter = placedHere.openRight)),
            distAfter--,
            fromNext && (content = content.addToStart(closeNode(fromNext, fillFrom($from, depth + 1, placed), $from, null, depth + 1))),
            toNext ? content = closeTo(content, $to, depth + 1, placedHere ? placedHere.openRight : 0) : placedHere && (content = closeRight(content, placedHere.openRight)),
            distAfter++,
            content
        }
        function fillFrom($from, depth, placed) {
            var placedHere = placed[depth]
              , content = _model.Fragment.empty;
            return placedHere && (content = closeRight(placedHere.content, placedHere.openRight),
            placedHere.isEnd && (distAfter = placedHere.openRight)),
            distAfter--,
            $from.depth > depth && (content = content.addToStart(closeNode($from.node(depth + 1), fillFrom($from, depth + 1, placed), $from, null, depth + 1))),
            distAfter++,
            content
        }
        function closeTo(content, $to, depth, openDepth) {
            var after = $to.node(depth);
            if (0 == openDepth || !after.type.canContainContent(content.lastChild.type)) {
                var finish = closeNode(after, fillTo($to, depth), null, $to, depth);
                return distAfter += finish.nodeSize,
                closeRight(content, openDepth).addToEnd(finish)
            }
            var inner = content.lastChild.content;
            return depth < $to.depth && (inner = closeTo(inner, $to, depth + 1, openDepth - 1)),
            content.replaceChild(content.childCount - 1, after.copy(inner))
        }
        function fillTo(to, depth) {
            return to.depth == depth ? _model.Fragment.empty : _model.Fragment.from(closeNode(to.node(depth + 1), fillTo(to, depth + 1), null, to, depth + 1))
        }
        function closeRight(content, openDepth) {
            if (0 == openDepth)
                return content;
            var last = content.lastChild
              , closed = closeNode(last, closeRight(last.content, openDepth - 1));
            return closed == last ? content : content.replaceChild(content.childCount - 1, closed)
        }
        function closeLeft(content, openDepth) {
            if (0 == openDepth)
                return content;
            var first = content.firstChild
              , closed = closeNode(first, first.content);
            return closed == first ? content : content.replaceChild(0, closed)
        }
        function closeFragment(type, content, $to, $from, depth) {
            if (type.canBeEmpty)
                return content;
            var hasContent = content.size || $to && ($to.depth > depth || $to.index(depth)) || $from && ($from.depth > depth || $from.index(depth) < $from.node(depth).childCount);
            return hasContent ? content : type.defaultContent()
        }
        function closeNode(node, content, $to, $from, depth) {
            return node.copy(closeFragment(node.type, content, $to, $from, depth))
        }
        function nodeLeft(slice, depth) {
            for (var content = slice.content, i = 1; depth > i; i++)
                content = content.firstChild.content;
            return content.firstChild
        }
        function placeSlice($from, slice) {
            for (var dFrom = $from.depth, unplaced = null, openLeftUnplaced = 0, placed = [], parents = null, dSlice = slice.openLeft; ; --dSlice) {
                var curType = void 0
                  , curAttrs = void 0
                  , curFragment = void 0;
                if (dSlice >= 0) {
                    if (dSlice > 0) {
                        var _nodeLeft = nodeLeft(slice, dSlice);
                        curType = _nodeLeft.type,
                        curAttrs = _nodeLeft.attrs,
                        curFragment = _nodeLeft.content
                    } else
                        0 == dSlice && (curFragment = slice.content);
                    dSlice < slice.openLeft && (curFragment = curFragment.cut(curFragment.firstChild.nodeSize))
                } else
                    curFragment = _model.Fragment.empty,
                    curType = parents[parents.length + dSlice - 1];
                if (unplaced && (curFragment = curFragment.addToStart(unplaced)),
                0 == curFragment.size && 0 >= dSlice)
                    break;
                var found = findPlacement(curType, curFragment, $from, dFrom);
                if (found > -1) {
                    if (curFragment.size > 0 && (placed[found] = {
                        content: curFragment,
                        openLeft: openLeftUnplaced,
                        openRight: dSlice > 0 ? 0 : slice.openRight - dSlice,
                        isEnd: 0 >= dSlice,
                        depth: found
                    }),
                    0 >= dSlice)
                        break;
                    unplaced = null,
                    openLeftUnplaced = 0,
                    dFrom = Math.max(0, found - 1)
                } else {
                    if (0 == dSlice) {
                        if (parents = $from.node(0).type.findConnectionToKind(curFragment.leastSuperKind()),
                        !parents)
                            break;
                        parents.unshift($from.node(0).type),
                        curType = parents[parents.length - 1]
                    }
                    unplaced = curType.create(curAttrs, curFragment),
                    openLeftUnplaced++
                }
            }
            return placed
        }
        function findPlacement(type, fragment, $from, start) {
            for (var d = start; d >= 0; d--) {
                var fromType = $from.node(d).type;
                if (type ? fromType.canContainContent(type) : fromType.canContainFragment(fragment))
                    return d
            }
            return -1
        }
        function mergeTextblockAfter(tr, $inside, $after) {
            for (var base = $inside.sameDepth($after), end = $after.end($after.depth), cutAt = end + 1, cutDepth = $after.depth - 1; cutDepth > base && $after.index(cutDepth) + 1 == $after.node(cutDepth).childCount; )
                --cutDepth,
                ++cutAt;
            cutDepth > base && tr.split(cutAt, cutDepth - base);
            for (var types = [], attrs = [], i = base + 1; i <= $inside.depth; i++) {
                var node = $inside.node(i);
                types.push(node.type),
                attrs.push(node.attrs)
            }
            tr.step("ancestor", $after.pos, end, {
                depth: $after.depth - base,
                types: types,
                attrs: attrs
            }),
            tr.join($after.pos - ($after.depth - base), $inside.depth - base)
        }
        var _model = require("../model")
          , _transform = require("./transform")
          , _step = require("./step")
          , _map = require("./map");
        _step.Step.define("replace", {
            apply: function(doc, step) {
                return _step.StepResult.fromReplace(doc, step.from, step.to, step.param)
            },
            posMap: function(step) {
                return new _map.PosMap([step.from, step.to - step.from, step.param.size])
            },
            invert: function(step, oldDoc) {
                return new _step.Step("replace",step.from,step.from + step.param.size,oldDoc.slice(step.from, step.to))
            },
            paramToJSON: function(param) {
                return param.toJSON()
            },
            paramFromJSON: function(schema, json) {
                return _model.Slice.fromJSON(schema, json)
            }
        }),
        _transform.Transform.prototype["delete"] = function(from, to) {
            return from != to && this.replace(from, to, _model.Slice.empty),
            this
        }
        ,
        _transform.Transform.prototype.replace = function(from) {
            var to = arguments.length <= 1 || void 0 === arguments[1] ? from : arguments[1]
              , slice = arguments.length <= 2 || void 0 === arguments[2] ? _model.Slice.empty : arguments[2]
              , $from = this.doc.resolve(from)
              , $to = this.doc.resolve(to)
              , _fitSliceInto = fitSliceInto($from, $to, slice)
              , fitted = _fitSliceInto.fitted
              , distAfter = _fitSliceInto.distAfter
              , fSize = fitted.size;
            if (from == to && !fSize)
                return this;
            if (this.step("replace", from, to, fitted),
            !fSize || !$to.parent.isTextblock)
                return this;
            var after = from + fSize
              , inner = slice.size ? 0 > distAfter ? -1 : after - distAfter : from
              , $inner = void 0;
            return -1 != inner && inner != after && ($inner = this.doc.resolve(inner)).parent.isTextblock && $inner.parent.type.canContainFragment($to.parent.content) ? (mergeTextblockAfter(this, $inner, this.doc.resolve(after)),
            this) : this
        }
        ,
        _transform.Transform.prototype.replaceWith = function(from, to, content) {
            return this.replace(from, to, new _model.Slice(_model.Fragment.from(content),0,0))
        }
        ,
        _transform.Transform.prototype.insert = function(pos, content) {
            return this.replaceWith(pos, pos, content)
        }
        ,
        _transform.Transform.prototype.insertText = function(pos, text) {
            return this.insert(pos, this.doc.type.schema.text(text, this.doc.marksAt(pos)))
        }
        ,
        _transform.Transform.prototype.insertInline = function(pos, node) {
            return this.insert(pos, node.mark(this.doc.marksAt(pos)))
        }
        ;
        var distAfter = 0
    }
    , {
        "../model": 34,
        "./map": 43,
        "./step": 47,
        "./transform": 48
    }],
    46: [function(require, module, exports) {
        "use strict";
        var _model = require("../model")
          , _transform = require("./transform")
          , _step = require("./step")
          , _map = require("./map");
        _step.Step.define("split", {
            apply: function(doc, step) {
                var $pos = doc.resolve(step.from)
                  , parent = $pos.parent
                  , cut = [parent.copy(), step.param ? step.param.type.create(step.attrs) : parent.copy()];
                return _step.StepResult.fromReplace(doc, $pos.pos, $pos.pos, new _model.Slice(_model.Fragment.fromArray(cut),1,1))
            },
            posMap: function(step) {
                return new _map.PosMap([step.from, 0, 2])
            },
            invert: function(step) {
                return new _step.Step("join",step.from,step.from + 2)
            },
            paramToJSON: function(param) {
                return param && {
                    type: param.type.name,
                    attrs: param.attrs
                }
            },
            paramFromJSON: function(schema, json) {
                return json && {
                    type: schema.nodeType(json.type),
                    attrs: json.attrs
                }
            }
        }),
        _transform.Transform.prototype.split = function(pos) {
            for (var depth = arguments.length <= 1 || void 0 === arguments[1] ? 1 : arguments[1], typeAfter = arguments[2], attrsAfter = arguments[3], i = 0; depth > i; i++)
                this.step("split", pos + i, pos + i, 0 == i && typeAfter ? {
                    type: typeAfter,
                    attrs: attrsAfter
                } : null);
            return this
        }
        ,
        _transform.Transform.prototype.splitIfNeeded = function(pos) {
            for (var depth = arguments.length <= 1 || void 0 === arguments[1] ? 1 : arguments[1], $pos = this.doc.resolve(pos), before = !0, i = 0; depth > i; i++) {
                var d = $pos.depth - i
                  , point = 0 == i ? $pos.pos : before ? $pos.before(d + 1) : $pos.after(d + 1);
                if (point == $pos.start(d))
                    before = !0;
                else {
                    if (point != $pos.end(d))
                        return this.split(point, depth - i);
                    before = !1
                }
            }
            return this
        }
    }
    , {
        "../model": 34,
        "./map": 43,
        "./step": 47,
        "./transform": 48
    }],
    47: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.StepResult = exports.Step = void 0;
        var _model = require("../model")
          , _map = require("./map")
          , steps = (exports.Step = function() {
            function Step(type, from, to) {
                var param = arguments.length <= 3 || void 0 === arguments[3] ? null : arguments[3];
                if (_classCallCheck(this, Step),
                !(type in steps))
                    throw new RangeError("Unknown step type: " + type);
                this.type = type,
                this.from = from,
                this.to = to,
                this.param = param
            }
            return _createClass(Step, [{
                key: "apply",
                value: function(doc) {
                    return steps[this.type].apply(doc, this)
                }
            }, {
                key: "posMap",
                value: function() {
                    var type = steps[this.type];
                    return type.posMap ? type.posMap(this) : _map.PosMap.empty
                }
            }, {
                key: "invert",
                value: function(oldDoc) {
                    return steps[this.type].invert(this, oldDoc)
                }
            }, {
                key: "map",
                value: function(remapping) {
                    var from = remapping.mapResult(this.from, 1)
                      , to = this.to == this.from ? from : remapping.mapResult(this.to, -1);
                    return from.deleted && to.deleted ? null : new Step(this.type,from.pos,Math.max(from.pos, to.pos),this.param)
                }
            }, {
                key: "toJSON",
                value: function() {
                    var impl = steps[this.type];
                    return {
                        type: this.type,
                        from: this.from,
                        to: this.to,
                        param: impl.paramToJSON ? impl.paramToJSON(this.param) : this.param
                    }
                }
            }, {
                key: "toString",
                value: function() {
                    return this.type + "@" + this.from + "-" + this.to
                }
            }], [{
                key: "fromJSON",
                value: function(schema, json) {
                    var impl = steps[json.type];
                    return new Step(json.type,json.from,json.to,impl.paramFromJSON ? impl.paramFromJSON(schema, json.param) : json.param)
                }
            }, {
                key: "define",
                value: function(type, implementation) {
                    steps[type] = implementation
                }
            }]),
            Step
        }(),
        Object.create(null));
        exports.StepResult = function() {
            function StepResult(doc, failed) {
                _classCallCheck(this, StepResult),
                this.doc = doc,
                this.failed = failed
            }
            return _createClass(StepResult, null, [{
                key: "ok",
                value: function(doc) {
                    return new StepResult(doc,null)
                }
            }, {
                key: "fail",
                value: function(val) {
                    return new StepResult(null,val)
                }
            }, {
                key: "fromReplace",
                value: function(doc, from, to, slice) {
                    try {
                        return StepResult.ok(doc.replace(from, to, slice))
                    } catch (e) {
                        if (e instanceof _model.ReplaceError)
                            return StepResult.fail(e.message);
                        throw e
                    }
                }
            }]),
            StepResult
        }()
    }
    , {
        "../model": 34,
        "./map": 43
    }],
    48: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Transform = exports.TransformError = void 0;
        var _error = require("../util/error")
          , _step2 = require("./step")
          , _map = require("./map")
          , TransformError = exports.TransformError = function(_ProseMirrorError) {
            function TransformError() {
                return _classCallCheck(this, TransformError),
                _possibleConstructorReturn(this, Object.getPrototypeOf(TransformError).apply(this, arguments))
            }
            return _inherits(TransformError, _ProseMirrorError),
            TransformError
        }(_error.ProseMirrorError)
          , Transform = function() {
            function Transform(doc) {
                _classCallCheck(this, Transform),
                this.doc = doc,
                this.docs = [],
                this.steps = [],
                this.maps = []
            }
            return _createClass(Transform, [{
                key: "step",
                value: function(_step, from, to, param) {
                    "string" == typeof _step && (_step = new _step2.Step(_step,from,to,param));
                    var result = this.maybeStep(_step);
                    if (result.failed)
                        throw new TransformError(result.failed);
                    return this
                }
            }, {
                key: "maybeStep",
                value: function(step) {
                    var result = step.apply(this.doc);
                    return result.failed || (this.docs.push(this.doc),
                    this.steps.push(step),
                    this.maps.push(step.posMap()),
                    this.doc = result.doc),
                    result
                }
            }, {
                key: "mapResult",
                value: function(pos, bias) {
                    return (0,
                    _map.mapThroughResult)(this.maps, pos, bias)
                }
            }, {
                key: "map",
                value: function(pos, bias) {
                    return (0,
                    _map.mapThrough)(this.maps, pos, bias)
                }
            }, {
                key: "before",
                get: function() {
                    return this.docs.length ? this.docs[0] : this.doc
                }
            }]),
            Transform
        }();
        exports.Transform = Transform
    }
    , {
        "../util/error": 52,
        "./map": 43,
        "./step": 47
    }],
    49: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function openPrompt(pm, content, options) {
            var button = (0,
            _dom.elt)("button", {
                "class": "ProseMirror-prompt-close"
            })
              , wrapper = (0,
            _dom.elt)("div", {
                "class": "ProseMirror-prompt"
            }, content, button)
              , outerBox = pm.wrapper.getBoundingClientRect();
            if (pm.wrapper.appendChild(wrapper),
            options && options.pos)
                wrapper.style.left = options.pos.left - outerBox.left + "px",
                wrapper.style.top = options.pos.top - outerBox.top + "px";
            else {
                var blockBox = wrapper.getBoundingClientRect()
                  , cX = Math.max(0, outerBox.left) + Math.min(window.innerWidth, outerBox.right) - blockBox.width
                  , cY = Math.max(0, outerBox.top) + Math.min(window.innerHeight, outerBox.bottom) - blockBox.height;
                wrapper.style.left = cX / 2 - outerBox.left + "px",
                wrapper.style.top = cY / 2 - outerBox.top + "px"
            }
            var close = function close() {
                pm.off("interaction", close),
                wrapper.parentNode && (wrapper.parentNode.removeChild(wrapper),
                options && options.onClose && options.onClose())
            };
            return button.addEventListener("click", close),
            pm.on("interaction", close),
            {
                close: close
            }
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.ParamPrompt = void 0,
        exports.openPrompt = openPrompt;
        var _dom = require("../dom")
          , ParamPrompt = exports.ParamPrompt = function() {
            function ParamPrompt(pm, command) {
                var _this = this;
                _classCallCheck(this, ParamPrompt),
                this.pm = pm,
                this.command = command,
                this.doClose = null,
                this.fields = command.params.map(function(param) {
                    if (!(param.type in _this.paramTypes))
                        throw new RangeError("Unsupported parameter type: " + param.type);
                    return _this.paramTypes[param.type].render.call(_this.pm, param, _this.defaultValue(param))
                });
                var promptTitle = (0,
                _dom.elt)("h5", {}, command.spec && command.spec.label ? pm.translate(command.spec.label) : "")
                  , submitButton = (0,
                _dom.elt)("button", {
                    type: "submit",
                    "class": "ProseMirror-prompt-submit"
                }, "Ok")
                  , cancelButton = (0,
                _dom.elt)("button", {
                    type: "button",
                    "class": "ProseMirror-prompt-cancel"
                }, "Cancel");
                cancelButton.addEventListener("click", function() {
                    return _this.close()
                }),
                this.form = (0,
                _dom.elt)("form", null, promptTitle, this.fields.map(function(f) {
                    return (0,
                    _dom.elt)("div", null, f)
                }), (0,
                _dom.elt)("div", {
                    "class": "ProseMirror-prompt-buttons"
                }, submitButton, " ", cancelButton))
            }
            return _createClass(ParamPrompt, [{
                key: "close",
                value: function() {
                    this.doClose && (this.doClose(),
                    this.doClose = null)
                }
            }, {
                key: "open",
                value: function() {
                    var _this2 = this;
                    this.close();
                    var prompt = this.prompt()
                      , hadFocus = this.pm.hasFocus();
                    this.doClose = function() {
                        prompt.close(),
                        hadFocus && setTimeout(function() {
                            return _this2.pm.focus()
                        }, 50)
                    }
                    ;
                    var submit = function() {
                        var params = _this2.values();
                        params && (_this2.close(),
                        _this2.command.exec(_this2.pm, params))
                    };
                    this.form.addEventListener("submit", function(e) {
                        e.preventDefault(),
                        submit()
                    }),
                    this.form.addEventListener("keydown", function(e) {
                        27 == e.keyCode ? (e.preventDefault(),
                        prompt.close()) : 13 != e.keyCode || e.ctrlKey || e.metaKey || e.shiftKey || (e.preventDefault(),
                        submit())
                    });
                    var input = this.form.querySelector("input, textarea");
                    input && input.focus()
                }
            }, {
                key: "values",
                value: function() {
                    for (var result = [], i = 0; i < this.command.params.length; i++) {
                        var param = this.command.params[i]
                          , dom = this.fields[i]
                          , type = this.paramTypes[param.type]
                          , value = void 0
                          , bad = void 0;
                        if (type.validate && (bad = type.validate(dom)),
                        bad || (value = type.read.call(this.pm, dom),
                        param.validate ? bad = param.validate(value) : value || null != param["default"] || (bad = "No default value available")),
                        bad)
                            return type.reportInvalid ? type.reportInvalid.call(this.pm, dom, bad) : this.reportInvalid(dom, bad),
                            null;
                        result.push(value)
                    }
                    return result
                }
            }, {
                key: "defaultValue",
                value: function(param) {
                    if (param.prefill) {
                        var prefill = param.prefill.call(this.command.self, this.pm);
                        if (null != prefill)
                            return prefill
                    }
                    return param["default"]
                }
            }, {
                key: "prompt",
                value: function() {
                    var _this3 = this;
                    return openPrompt(this.pm, this.form, {
                        onClose: function() {
                            return _this3.close()
                        }
                    })
                }
            }, {
                key: "reportInvalid",
                value: function(dom, message) {
                    var parent = dom.parentNode
                      , style = "left: " + (dom.offsetLeft + dom.offsetWidth + 2) + "px; top: " + (dom.offsetTop - 5) + "px"
                      , msg = parent.appendChild((0,
                    _dom.elt)("div", {
                        "class": "ProseMirror-invalid",
                        style: style
                    }, message));
                    setTimeout(function() {
                        return parent.removeChild(msg)
                    }, 1500)
                }
            }]),
            ParamPrompt
        }();
        ParamPrompt.prototype.paramTypes = Object.create(null),
        ParamPrompt.prototype.paramTypes.text = {
            render: function(param, value) {
                return (0,
                _dom.elt)("input", {
                    type: "text",
                    placeholder: this.translate(param.label),
                    value: value,
                    autocomplete: "off"
                })
            },
            read: function(dom) {
                return dom.value
            }
        },
        ParamPrompt.prototype.paramTypes.select = {
            render: function(param, value) {
                var _this4 = this
                  , options = param.options.call ? param.options(this) : param.options;
                return (0,
                _dom.elt)("select", null, options.map(function(o) {
                    return (0,
                    _dom.elt)("option", {
                        value: o.value,
                        selected: o.value == value ? "true" : null
                    }, _this4.translate(o.label))
                }))
            },
            read: function(dom) {
                return dom.value
            }
        },
        (0,
        _dom.insertCSS)('\n.ProseMirror-prompt {\n  background: white;\n  padding: 2px 6px 2px 15px;\n  border: 1px solid silver;\n  position: absolute;\n  border-radius: 3px;\n  z-index: 11;\n}\n\n.ProseMirror-prompt h5 {\n  margin: 0;\n  font-weight: normal;\n  font-size: 100%;\n  color: #444;\n}\n\n.ProseMirror-prompt input[type="text"],\n.ProseMirror-prompt textarea {\n  background: #eee;\n  border: none;\n  outline: none;\n}\n\n.ProseMirror-prompt input[type="text"] {\n  padding: 0 4px;\n}\n\n.ProseMirror-prompt-close {\n  position: absolute;\n  left: 2px; top: 1px;\n  color: #666;\n  border: none; background: transparent; padding: 0;\n}\n\n.ProseMirror-prompt-close:after {\n  content: "✕";\n  font-size: 12px;\n}\n\n.ProseMirror-invalid {\n  background: #ffc;\n  border: 1px solid #cc7;\n  border-radius: 4px;\n  padding: 5px 10px;\n  position: absolute;\n  min-width: 10em;\n}\n\n.ProseMirror-prompt-buttons {\n  margin-top: 5px;\n  display: none;\n}\n\n')
    }
    , {
        "../dom": 1
    }],
    50: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function windowRect() {
            return {
                left: 0,
                right: window.innerWidth,
                top: 0,
                bottom: window.innerHeight
            }
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Tooltip = void 0;
        var _dom = require("../dom")
          , prefix = "ProseMirror-tooltip";
        exports.Tooltip = function() {
            function Tooltip(wrapper, options) {
                var _this = this;
                _classCallCheck(this, Tooltip),
                this.wrapper = wrapper,
                this.options = "string" == typeof options ? {
                    direction: options
                } : options,
                this.dir = this.options.direction || "above",
                this.pointer = wrapper.appendChild((0,
                _dom.elt)("div", {
                    "class": prefix + "-pointer-" + this.dir + " " + prefix + "-pointer"
                })),
                this.pointerWidth = this.pointerHeight = null,
                this.dom = wrapper.appendChild((0,
                _dom.elt)("div", {
                    "class": prefix
                })),
                this.dom.addEventListener("transitionend", function() {
                    "0" == _this.dom.style.opacity && (_this.dom.style.display = _this.pointer.style.display = "")
                }),
                this.isOpen = !1,
                this.lastLeft = this.lastTop = null
            }
            return _createClass(Tooltip, [{
                key: "detach",
                value: function() {
                    this.dom.parentNode.removeChild(this.dom),
                    this.pointer.parentNode.removeChild(this.pointer)
                }
            }, {
                key: "getSize",
                value: function(node) {
                    var wrap = this.wrapper.appendChild((0,
                    _dom.elt)("div", {
                        "class": prefix,
                        style: "display: block; position: absolute"
                    }, node))
                      , size = {
                        width: wrap.offsetWidth + 1,
                        height: wrap.offsetHeight
                    };
                    return wrap.parentNode.removeChild(wrap),
                    size
                }
            }, {
                key: "open",
                value: function(node, pos) {
                    for (var next, left = this.lastLeft = pos ? pos.left : this.lastLeft, top = this.lastTop = pos ? pos.top : this.lastTop, size = this.getSize(node), around = this.wrapper.getBoundingClientRect(), boundingRect = (this.options.getBoundingRect || windowRect)(), child = this.dom.firstChild; child; child = next)
                        next = child.nextSibling,
                        child != this.pointer && this.dom.removeChild(child);
                    this.dom.appendChild(node),
                    this.dom.style.display = this.pointer.style.display = "block",
                    null == this.pointerWidth && (this.pointerWidth = this.pointer.offsetWidth - 1,
                    this.pointerHeight = this.pointer.offsetHeight - 1),
                    this.dom.style.width = size.width + "px",
                    this.dom.style.height = size.height + "px";
                    var margin = 5;
                    if ("above" == this.dir || "below" == this.dir) {
                        var tipLeft = Math.max(boundingRect.left, Math.min(left - size.width / 2, boundingRect.right - size.width));
                        if (this.dom.style.left = tipLeft - around.left + "px",
                        this.pointer.style.left = left - around.left - this.pointerWidth / 2 + "px",
                        "above" == this.dir) {
                            var tipTop = top - around.top - margin - this.pointerHeight - size.height;
                            this.dom.style.top = tipTop + "px",
                            this.pointer.style.top = tipTop + size.height + "px"
                        } else {
                            var tipTop = top - around.top + margin;
                            this.pointer.style.top = tipTop + "px",
                            this.dom.style.top = tipTop + this.pointerHeight + "px"
                        }
                    } else if ("left" == this.dir || "right" == this.dir)
                        if (this.dom.style.top = top - around.top - size.height / 2 + "px",
                        this.pointer.style.top = top - this.pointerHeight / 2 - around.top + "px",
                        "left" == this.dir) {
                            var pointerLeft = left - around.left - margin - this.pointerWidth;
                            this.dom.style.left = pointerLeft - size.width + "px",
                            this.pointer.style.left = pointerLeft + "px"
                        } else {
                            var pointerLeft = left - around.left + margin;
                            this.dom.style.left = pointerLeft + this.pointerWidth + "px",
                            this.pointer.style.left = pointerLeft + "px"
                        }
                    else if ("center" == this.dir) {
                        var _top = Math.max(around.top, boundingRect.top)
                          , bottom = Math.min(around.bottom, boundingRect.bottom)
                          , fromTop = (bottom - _top - size.height) / 2;
                        this.dom.style.left = (around.width - size.width) / 2 + "px",
                        this.dom.style.top = _top - around.top + fromTop + "px"
                    }
                    getComputedStyle(this.dom).opacity,
                    getComputedStyle(this.pointer).opacity,
                    this.dom.style.opacity = this.pointer.style.opacity = 1,
                    this.isOpen = !0
                }
            }, {
                key: "close",
                value: function() {
                    this.isOpen && (this.isOpen = !1,
                    this.dom.style.opacity = this.pointer.style.opacity = 0)
                }
            }]),
            Tooltip
        }();
        (0,
        _dom.insertCSS)("\n\n." + prefix + " {\n  position: absolute;\n  display: none;\n  box-sizing: border-box;\n  -moz-box-sizing: border- box;\n  overflow: hidden;\n\n  -webkit-transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  -moz-transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  opacity: 0;\n\n  border-radius: 5px;\n  padding: 3px 7px;\n  margin: 0;\n  background: white;\n  border: 1px solid #777;\n  color: #555;\n\n  z-index: 11;\n}\n\n." + prefix + "-pointer {\n  position: absolute;\n  display: none;\n  width: 0; height: 0;\n\n  -webkit-transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  -moz-transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  opacity: 0;\n\n  z-index: 12;\n}\n\n." + prefix + '-pointer:after {\n  content: "";\n  position: absolute;\n  display: block;\n}\n\n.' + prefix + "-pointer-above {\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-top: 6px solid #777;\n}\n\n." + prefix + "-pointer-above:after {\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-top: 6px solid white;\n  left: -6px; top: -7px;\n}\n\n." + prefix + "-pointer-below {\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-bottom: 6px solid #777;\n}\n\n." + prefix + "-pointer-below:after {\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-bottom: 6px solid white;\n  left: -6px; top: 1px;\n}\n\n." + prefix + "-pointer-right {\n  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n  border-right: 6px solid #777;\n}\n\n." + prefix + "-pointer-right:after {\n  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n  border-right: 6px solid white;\n  left: 1px; top: -6px;\n}\n\n." + prefix + "-pointer-left {\n  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n  border-left: 6px solid #777;\n}\n\n." + prefix + "-pointer-left:after {\n  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n  border-left: 6px solid white;\n  left: -7px; top: -6px;\n}\n\n." + prefix + ' input[type="text"],\n.' + prefix + " textarea {\n  background: #eee;\n  border: none;\n  outline: none;\n}\n\n." + prefix + ' input[type="text"] {\n  padding: 0 4px;\n}\n\n')
    }
    , {
        "../dom": 1
    }],
    51: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function scheduleDOMUpdate(pm, f) {
            CentralScheduler.get(pm).set(f)
        }
        function unscheduleDOMUpdate(pm, f) {
            CentralScheduler.get(pm).unset(f)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.scheduleDOMUpdate = scheduleDOMUpdate,
        exports.unscheduleDOMUpdate = unscheduleDOMUpdate;
        var UPDATE_TIMEOUT = 50
          , MIN_FLUSH_DELAY = 100
          , CentralScheduler = function() {
            function CentralScheduler(pm) {
                var _this = this;
                _classCallCheck(this, CentralScheduler),
                this.waiting = [],
                this.timeout = null,
                this.lastForce = 0,
                this.pm = pm,
                this.timedOut = function() {
                    _this.pm.operation ? _this.timeout = setTimeout(_this.timedOut, UPDATE_TIMEOUT) : _this.force()
                }
                ,
                pm.on("flush", this.onFlush.bind(this))
            }
            return _createClass(CentralScheduler, [{
                key: "set",
                value: function(f) {
                    0 == this.waiting.length && (this.timeout = setTimeout(this.timedOut, UPDATE_TIMEOUT)),
                    -1 == this.waiting.indexOf(f) && this.waiting.push(f)
                }
            }, {
                key: "unset",
                value: function(f) {
                    var index = this.waiting.indexOf(f);
                    index > -1 && this.waiting.splice(index, 1)
                }
            }, {
                key: "force",
                value: function() {
                    for (clearTimeout(this.timeout),
                    this.lastForce = Date.now(); this.waiting.length; )
                        for (var i = 0; i < this.waiting.length; i++) {
                            var result = this.waiting[i]();
                            result ? this.waiting[i] = result : this.waiting.splice(i--, 1)
                        }
                }
            }, {
                key: "onFlush",
                value: function() {
                    this.waiting.length && Date.now() - this.lastForce > MIN_FLUSH_DELAY && this.force()
                }
            }], [{
                key: "get",
                value: function(pm) {
                    return pm.mod.centralScheduler || (pm.mod.centralScheduler = new this(pm))
                }
            }]),
            CentralScheduler
        }();
        exports.UpdateScheduler = function() {
            function UpdateScheduler(pm, events, start) {
                var _this2 = this;
                _classCallCheck(this, UpdateScheduler),
                this.pm = pm,
                this.start = start,
                this.events = events.split(" "),
                this.onEvent = this.onEvent.bind(this),
                this.events.forEach(function(event) {
                    return pm.on(event, _this2.onEvent)
                })
            }
            return _createClass(UpdateScheduler, [{
                key: "detach",
                value: function() {
                    var _this3 = this;
                    unscheduleDOMUpdate(this.pm, this.start),
                    this.events.forEach(function(event) {
                        return _this3.pm.off(event, _this3.onEvent)
                    })
                }
            }, {
                key: "onEvent",
                value: function() {
                    scheduleDOMUpdate(this.pm, this.start)
                }
            }, {
                key: "force",
                value: function() {
                    if (this.pm.operation)
                        this.onEvent();
                    else {
                        unscheduleDOMUpdate(this.pm, this.start);
                        for (var run = this.start; run; run = run())
                            ;
                    }
                }
            }]),
            UpdateScheduler
        }()
    }
    , {}],
    52: [function(require, module, exports) {
        "use strict";
        function ProseMirrorError(message) {
            Error.call(this, message),
            this.message != message && (this.message = message,
            Error.captureStackTrace ? Error.captureStackTrace(this, this.name) : this.stack = new Error(message).stack)
        }
        function functionName(f) {
            var match = /^function (\w+)/.exec(f.toString());
            return match && match[1]
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.ProseMirrorError = ProseMirrorError,
        ProseMirrorError.prototype = Object.create(Error.prototype),
        ProseMirrorError.prototype.constructor = ProseMirrorError,
        Object.defineProperty(ProseMirrorError.prototype, "name", {
            get: function() {
                return this.constructor.name || functionName(this.constructor) || "ProseMirrorError"
            }
        })
    }
    , {}],
    53: [function(require, module, exports) {
        "use strict";
        function getHandlers(obj, type) {
            return obj._handlers && obj._handlers[type] || noHandlers
        }
        function eventMixin(ctor) {
            var proto = ctor.prototype;
            for (var prop in methods)
                methods.hasOwnProperty(prop) && (proto[prop] = methods[prop])
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.eventMixin = eventMixin;
        var noHandlers = []
          , methods = {
            on: function(type, handler) {
                var map = this._handlers || (this._handlers = Object.create(null));
                map[type] = type in map ? map[type].concat(handler) : [handler]
            },
            off: function(type, handler) {
                var map = this._handlers
                  , arr = map && map[type];
                if (arr)
                    for (var i = 0; i < arr.length; ++i)
                        if (arr[i] == handler) {
                            map[type] = arr.slice(0, i).concat(arr.slice(i + 1));
                            break
                        }
            },
            signal: function(type) {
                for (var arr = getHandlers(this, type), _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _len > _key; _key++)
                    args[_key - 1] = arguments[_key];
                for (var i = 0; i < arr.length; ++i)
                    arr[i].apply(arr, args)
            },
            signalHandleable: function(type) {
                for (var arr = getHandlers(this, type), _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _len2 > _key2; _key2++)
                    args[_key2 - 1] = arguments[_key2];
                for (var i = 0; i < arr.length; ++i) {
                    var result = arr[i].apply(arr, args);
                    if (null != result)
                        return result
                }
            },
            signalPipelined: function(type, value) {
                for (var arr = getHandlers(this, type), i = 0; i < arr.length; ++i)
                    value = arr[i](value);
                return value
            },
            signalDOM: function(event, type) {
                for (var arr = getHandlers(this, type || event.type), i = 0; i < arr.length; ++i)
                    if (arr[i](event) || event.defaultPrevented)
                        return !0;
                return !1
            },
            hasHandler: function(type) {
                return getHandlers(this, type).length > 0
            }
        }
    }
    , {}],
    54: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        exports.Map = window.Map || function() {
            function _class() {
                _classCallCheck(this, _class),
                this.content = []
            }
            return _createClass(_class, [{
                key: "set",
                value: function(key, value) {
                    var found = this.find(key);
                    found > -1 ? this.content[found + 1] = value : this.content.push(key, value)
                }
            }, {
                key: "get",
                value: function(key) {
                    var found = this.find(key);
                    return -1 == found ? void 0 : this.content[found + 1]
                }
            }, {
                key: "has",
                value: function(key) {
                    return this.find(key) > -1
                }
            }, {
                key: "find",
                value: function(key) {
                    for (var i = 0; i < this.content.length; i += 2)
                        if (this.content[i] === key)
                            return i
                }
            }, {
                key: "clear",
                value: function() {
                    this.content.length = 0
                }
            }, {
                key: "size",
                get: function() {
                    return this.content.length / 2
                }
            }]),
            _class
        }()
    }
    , {}],
    55: [function(require, module, exports) {
        "use strict";
        function copyObj(obj, base) {
            var copy = base || Object.create(null);
            for (var prop in obj)
                copy[prop] = obj[prop];
            return copy
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.copyObj = copyObj
    }
    , {}],
    56: [function(require, module, exports) {
        "use strict";
        function sortedInsert(array, elt, compare) {
            for (var i = 0; i < array.length && !(compare(array[i], elt) > 0); i++)
                ;
            array.splice(i, 0, elt)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports["default"] = sortedInsert
    }
    , {}],
    57: [function(require, module, exports) {
        !function(mod) {
            if ("object" == typeof exports && "object" == typeof module)
                module.exports = mod();
            else {
                if ("function" == typeof define && define.amd)
                    return define([], mod);
                (this || window).browserKeymap = mod()
            }
        }(function() {
            "use strict";
            function keyName(event) {
                if ("keypress" == event.type)
                    return "'" + String.fromCharCode(event.charCode) + "'";
                var base = keyNames[event.keyCode]
                  , name = base;
                return null == name || event.altGraphKey ? null : (event.altKey && "Alt" != base && (name = "Alt-" + name),
                event.ctrlKey && "Ctrl" != base && (name = "Ctrl-" + name),
                event.metaKey && "Cmd" != base && (name = "Cmd-" + name),
                event.shiftKey && "Shift" != base && (name = "Shift-" + name),
                name)
            }
            function isModifierKey(name) {
                return name = /[^-]*$/.exec(name)[0],
                "Ctrl" == name || "Alt" == name || "Shift" == name || "Mod" == name
            }
            function normalizeKeyName(name) {
                for (var alt, ctrl, shift, cmd, parts = name.split(/-(?!'?$)/), result = parts[parts.length - 1], i = 0; i < parts.length - 1; i++) {
                    var mod = parts[i];
                    if (/^(cmd|meta|m)$/i.test(mod))
                        cmd = !0;
                    else if (/^a(lt)?$/i.test(mod))
                        alt = !0;
                    else if (/^(c|ctrl|control)$/i.test(mod))
                        ctrl = !0;
                    else if (/^s(hift)$/i.test(mod))
                        shift = !0;
                    else {
                        if (!/^mod$/i.test(mod))
                            throw new Error("Unrecognized modifier name: " + mod);
                        mac ? cmd = !0 : ctrl = !0
                    }
                }
                return alt && (result = "Alt-" + result),
                ctrl && (result = "Ctrl-" + result),
                cmd && (result = "Cmd-" + result),
                shift && (result = "Shift-" + result),
                result
            }
            function Keymap(keys, options) {
                if (this.options = options || {},
                this.bindings = Object.create(null),
                keys)
                    for (var keyname in keys)
                        Object.prototype.hasOwnProperty.call(keys, keyname) && this.addBinding(keyname, keys[keyname])
            }
            for (var mac = "undefined" != typeof navigator ? /Mac/.test(navigator.platform) : "undefined" != typeof os ? "darwin" == os.platform() : !1, keyNames = {
                3: "Enter",
                8: "Backspace",
                9: "Tab",
                13: "Enter",
                16: "Shift",
                17: "Ctrl",
                18: "Alt",
                19: "Pause",
                20: "CapsLock",
                27: "Esc",
                32: "Space",
                33: "PageUp",
                34: "PageDown",
                35: "End",
                36: "Home",
                37: "Left",
                38: "Up",
                39: "Right",
                40: "Down",
                44: "PrintScrn",
                45: "Insert",
                46: "Delete",
                59: ";",
                61: "=",
                91: "Mod",
                92: "Mod",
                93: "Mod",
                106: "*",
                107: "=",
                109: "-",
                110: ".",
                111: "/",
                127: "Delete",
                173: "-",
                186: ";",
                187: "=",
                188: ",",
                189: "-",
                190: ".",
                191: "/",
                192: "`",
                219: "[",
                220: "\\",
                221: "]",
                222: "'",
                63232: "Up",
                63233: "Down",
                63234: "Left",
                63235: "Right",
                63272: "Delete",
                63273: "Home",
                63275: "End",
                63276: "PageUp",
                63277: "PageDown",
                63302: "Insert"
            }, i = 0; 10 > i; i++)
                keyNames[i + 48] = keyNames[i + 96] = String(i);
            for (var i = 65; 90 >= i; i++)
                keyNames[i] = String.fromCharCode(i);
            for (var i = 1; 12 >= i; i++)
                keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
            return Keymap.prototype = {
                normalize: function(name) {
                    return this.options.multi !== !1 ? name.split(/ +(?!\'$)/).map(normalizeKeyName) : [normalizeKeyName(name)]
                },
                addBinding: function(keyname, value) {
                    for (var keys = this.normalize(keyname), i = 0; i < keys.length; i++) {
                        var name = keys.slice(0, i + 1).join(" ")
                          , val = i == keys.length - 1 ? value : "..."
                          , prev = this.bindings[name];
                        if (prev) {
                            if (prev != val)
                                throw new Error("Inconsistent bindings for " + name)
                        } else
                            this.bindings[name] = val
                    }
                },
                removeBinding: function(keyname) {
                    for (var keys = this.normalize(keyname), i = keys.length - 1; i >= 0; i--) {
                        var name = keys.slice(0, i).join(" ")
                          , val = this.bindings[name];
                        if ("..." == val && !this.unusedMulti(name))
                            break;
                        val && delete this.bindings[name]
                    }
                },
                unusedMulti: function(name) {
                    for (var binding in this.bindings)
                        if (binding.length > name && 0 == binding.indexOf(name) && " " == binding.charAt(name.length))
                            return !1;
                    return !0
                },
                lookup: function(key, context) {
                    return this.options.call ? this.options.call(key, context) : this.bindings[key]
                },
                constructor: Keymap
            },
            Keymap.keyName = keyName,
            Keymap.isModifierKey = isModifierKey,
            Keymap.normalizeKeyName = normalizeKeyName,
            Keymap
        })
    }
    , {}],
    58: [function(require, module, exports) {
        module.exports = function(element, fn) {
            function resizeListener(e) {
                var win = e.target || e.srcElement;
                win.__resizeRAF__ && cancelFrame(win.__resizeRAF__),
                win.__resizeRAF__ = requestFrame(function() {
                    var trigger = win.__resizeTrigger__;
                    trigger.__resizeListeners__.forEach(function(fn) {
                        fn.call(trigger, e)
                    })
                })
            }
            function objectLoad(e) {
                this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__,
                this.contentDocument.defaultView.addEventListener("resize", resizeListener)
            }
            var window = this
              , document = window.document
              , attachEvent = document.attachEvent;
            if ("undefined" != typeof navigator)
                var isIE = navigator.userAgent.match(/Trident/);
            var requestFrame = function() {
                var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) {
                    return window.setTimeout(fn, 20)
                }
                ;
                return function(fn) {
                    return raf(fn)
                }
            }()
              , cancelFrame = function() {
                var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
                return function(id) {
                    return cancel(id)
                }
            }();
            if (!element.__resizeListeners__)
                if (element.__resizeListeners__ = [],
                attachEvent)
                    element.__resizeTrigger__ = element,
                    element.attachEvent("onresize", resizeListener);
                else {
                    "static" == getComputedStyle(element).position && (element.style.position = "relative");
                    var obj = element.__resizeTrigger__ = document.createElement("object");
                    obj.setAttribute("style", "display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;"),
                    obj.setAttribute("class", "resize-sensor"),
                    obj.__resizeElement__ = element,
                    obj.onload = objectLoad,
                    obj.type = "text/html",
                    isIE && element.appendChild(obj),
                    obj.data = "about:blank",
                    isIE || element.appendChild(obj)
                }
            element.__resizeListeners__.push(fn)
        }
    }
    , {}],
    59: [function(require, module, exports) {
        "use strict";
        function fleschKincaid(counts) {
            return counts && counts.sentence && counts.word && counts.syllable ? SENTENCE_WEIGHT * (counts.word / counts.sentence) + WORD_WEIGHT * (counts.syllable / counts.word) - ADJUSTMENT : NaN
        }
        var SENTENCE_WEIGHT, WORD_WEIGHT, ADJUSTMENT;
        SENTENCE_WEIGHT = .39,
        WORD_WEIGHT = 11.8,
        ADJUSTMENT = 15.59,
        module.exports = fleschKincaid
    }
    , {}],
    60: [function(require, module, exports) {
        "use strict";
        function flesch(counts) {
            return counts && counts.sentence && counts.word && counts.syllable ? BASE - SENTENCE_WEIGHT * (counts.word / counts.sentence) - WORD_WEIGHT * (counts.syllable / counts.word) : NaN
        }
        var SENTENCE_WEIGHT, WORD_WEIGHT, BASE;
        SENTENCE_WEIGHT = 1.015,
        WORD_WEIGHT = 84.6,
        BASE = 206.835,
        module.exports = flesch
    }
    , {}],
    61: [function(require, module, exports) {
        function constructByRe() {
            return byRe = new RegExp(re.toString().slice(1, -3) + "\\s*by\\b","gi")
        }
        var byRe, irregulars = ["awoken", "been", "born", "beat", "become", "begun", "bent", "beset", "bet", "bid", "bidden", "bound", "bitten", "bled", "blown", "broken", "bred", "brought", "broadcast", "built", "burnt", "burst", "bought", "cast", "caught", "chosen", "clung", "come", "cost", "crept", "cut", "dealt", "dug", "dived", "done", "drawn", "dreamt", "driven", "drunk", "eaten", "fallen", "fed", "felt", "fought", "found", "fit", "fled", "flung", "flown", "forbidden", "forgotten", "foregone", "forgiven", "forsaken", "frozen", "gotten", "given", "gone", "ground", "grown", "hung", "heard", "hidden", "hit", "held", "hurt", "kept", "knelt", "knit", "known", "laid", "led", "leapt", "learnt", "left", "lent", "let", "lain", "lighted", "lost", "made", "meant", "met", "misspelt", "mistaken", "mown", "overcome", "overdone", "overtaken", "overthrown", "paid", "pled", "proven", "put", "quit", "read", "rid", "ridden", "rung", "risen", "run", "sawn", "said", "seen", "sought", "sold", "sent", "set", "sewn", "shaken", "shaven", "shorn", "shed", "shone", "shod", "shot", "shown", "shrunk", "shut", "sung", "sunk", "sat", "slept", "slain", "slid", "slung", "slit", "smitten", "sown", "spoken", "sped", "spent", "spilt", "spun", "spit", "split", "spread", "sprung", "stood", "stolen", "stuck", "stung", "stunk", "stridden", "struck", "strung", "striven", "sworn", "swept", "swollen", "swum", "swung", "taken", "taught", "torn", "told", "thought", "thrived", "thrown", "thrust", "trodden", "understood", "upheld", "upset", "woken", "worn", "woven", "wed", "wept", "wound", "won", "withheld", "withstood", "wrung", "written"], exceptions = ["indeed"], re = new RegExp("\\b(am|are|were|being|is|been|was|be)\\b\\s*([\\w]+ed|" + irregulars.join("|") + ")\\b","gi");
        module.exports = function(text, options) {
            for (var r = options && options.by ? byRe || constructByRe() : re, suggestions = []; match = r.exec(text); )
                -1 === exceptions.indexOf(match[2].toLowerCase()) && suggestions.push({
                    index: match.index,
                    offset: match[0].length
                });
            return suggestions
        }
    }
    , {}],
    62: [function(require, module, exports) {
        module.exports = {
            stats: function(text) {
                var data;
                return text.length && (data = {
                    sentences: this.sentences(text),
                    words: this.words(text),
                    syllables: this.syllables(text),
                    characters: this.characters(text),
                    carpar: this.charactersWords(text),
                    gulpease: this.gulpease(text),
                    gunningFog: this.gunningFog(text)
                }),
                data
            },
            findSentences: function(text) {
                var sentence, sentences, result, _i, _len;
                for (sentences = text.split("."),
                result = [],
                _i = 0,
                _len = sentences.length; _len > _i; _i++)
                    sentence = sentences[_i],
                    "" !== sentence.trim() && result.push(sentence);
                return result
            },
            sentences: function(text) {
                return this.findSentences(text).length
            },
            findWords: function(sentence) {
                return sentence.match(/[A-z\u00E0-\u00FC]+/g)
            },
            words: function(sentence) {
                return this.findWords(sentence).length
            },
            findSyllables: function(word) {
                return word = word.toLowerCase(),
                word.length <= 3 ? 1 : (word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, ""),
                word = word.replace(/^y/, ""),
                word.match(/[aeiouy]{1,2}/g))
            },
            syllables: function(word) {
                return this.findSyllables(word).length
            },
            characters: function(sentence) {
                var word, tot, _i, _len;
                for (sentence = this.findWords(sentence),
                tot = 0,
                _i = 0,
                _len = sentence.length; _len > _i; _i++)
                    word = sentence[_i],
                    null !== word && (tot += word.length);
                return tot
            },
            charactersWords: function(sentence) {
                var result, tot;
                return tot = this.characters(sentence),
                result = tot / this.words(sentence),
                result.toFixed(1)
            },
            gulpease: function(text) {
                var _characters, _sentences, _words, _result;
                return _sentences = this.sentences(text),
                _characters = this.characters(text),
                _words = this.words(text),
                _result = 89 + (300 * _sentences - 10 * _characters) / _words,
                parseInt(_result, 10)
            },
            gunningFog: function(text) {
                var word, _sentences, _i, _len, _words, _wordsComplesse, _result;
                for (_sentences = this.sentences(text),
                _words = this.words(text),
                _wordsComplesse = 0,
                _i = 0,
                _len = _words.length; _len > _i; _i++)
                    word = _words[_i],
                    this.syllables(word) > 2 && (_wordsComplesse += 1);
                return _result = .4 * (_words / _sentences + 100 * (_wordsComplesse / _words)),
                parseInt(_result, 10)
            }
        }
    }
    , {}],
    63: [function(require, module, exports) {
        "use strict";
        var _edit = require("prosemirror/dist/edit");
        require("prosemirror/dist/menu/tooltipmenu"),
        require("prosemirror/dist/menu/menubar"),
        require("prosemirror/dist/inputrules/autoinput");
        var _dom = require("prosemirror/dist/dom")
          , _utils = require("./utils")
          , _schema = require("./schema");
        window.pm = new _edit.ProseMirror({
            place: document.querySelector("#editor"),
            menuBar: _schema.mainMenuBar,
            schema: _schema.widgetSchema,
            commands: _schema.commands,
            autoInput: !0,
            doc: document.querySelector("#content"),
            docFormat: "dom"
        });
        (0,
        _utils.defineFileHandler)(function(files) {
            console.log(files)
        }),
        (0,
        _dom.insertCSS)("\n#editor {\n	width: 800px;\n}\n\n")
    }
    , {
        "./schema": 64,
        "./utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/edit": 11,
        "prosemirror/dist/inputrules/autoinput": 25,
        "prosemirror/dist/menu/menubar": 29,
        "prosemirror/dist/menu/tooltipmenu": 30
    }],
    64: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.grammarCommands = exports.commentOnlyCommands = exports.noCommands = exports.commentCommands = exports.commands = exports.commentMenuBar = exports.grammarMenuBar = exports.mainMenuBar = exports.widgetSchema = void 0;
        var _edit = require("prosemirror/dist/edit")
          , _dom = require("prosemirror/dist/dom")
          , _menu = require("prosemirror/dist/menu/menu")
          , _model = require("prosemirror/dist/model")
          , _questions = require("./widgets/questions")
          , _input = require("./widgets/input")
          , _content = require("./widgets/content")
          , _widgets = require("./widgets")
          , _tool = require("./widgets/tool")
          , widgetSpec = new _model.SchemaSpec({
            doc: _model.Doc,
            blockquote: _model.BlockQuote,
            ordered_list: _model.OrderedList,
            bullet_list: _model.BulletList,
            list_item: _model.ListItem,
            paragraph: _model.Paragraph,
            heading: _model.Heading,
            text: _model.Text,
            hard_break: _model.HardBreak,
            input: _input.Input,
            checkbox: _input.CheckBox,
            radiobutton: _input.RadioButton,
            select: _input.Select,
            textfield: _input.TextField,
            textarea: _input.TextArea,
            question: _questions.Question,
            textbox: _questions.TextBox,
            choice: _questions.Choice,
            multiplechoice: _questions.MultipleChoice,
            scaledisplay: _questions.ScaleDisplay,
            scale: _questions.Scale,
            checkitem: _questions.CheckItem,
            checklist: _questions.CheckList,
            shortanswer: _questions.ShortAnswer,
            essay: _questions.Essay,
            selection: _questions.Selection,
            horizontal_rule: _model.HorizontalRule,
            image: _content.Image,
            inlinemath: _content.InlineMath,
            blockmath: _content.BlockMath,
            website: _content.Website,
            carryforward: _content.CarryForward,
            spreadsheet: _content.SpreadSheet,
            graph: _content.Graph,
            leftalign: _widgets.LeftAlign,
            centeralign: _widgets.CenterAlign,
            rightalign: _widgets.RightAlign
        },{
            em: _model.EmMark,
            strong: _model.StrongMark,
            link: _model.LinkMark,
            code: _model.CodeMark,
            underline: _widgets.UnderlineMark,
            strikethrough: _widgets.StrikeThroughMark
        });
        exports.widgetSchema = new _model.Schema(widgetSpec),
        exports.mainMenuBar = {
            "float": !0,
            content: [[_menu.inlineGroup, _menu.insertMenu], [_menu.blockGroup, _menu.textblockMenu], _widgets.alignGroup, [_widgets.contentInsertMenu, _widgets.questionInsertMenu], _widgets.toolGroup, _menu.historyGroup]
        },
        exports.grammarMenuBar = {
            "float": !0,
            content: [[_menu.inlineGroup, _menu.insertMenu], [_menu.blockGroup, _menu.textblockMenu], _widgets.alignGroup, [_widgets.contentInsertMenu, _widgets.questionInsertMenu], _widgets.toolGroup, _menu.historyGroup]
        },
        exports.commentMenuBar = {
            "float": !0,
            content: [_widgets.toolGroup]
        };
        _menu.textblockMenu.options.label = "Format";
        var strongIcon = {
            type: "icon",
            width: 805,
            height: 1024,
            path: "M317 869q42 18 80 18 214 0 214-191 0-65-23-102-15-25-35-42t-38-26-46-14-48-6-54-1q-41 0-57 5 0 30-0 90t-0 90q0 4-0 38t-0 55 2 47 6 38zM309 442q24 4 62 4 46 0 81-7t62-25 42-51 14-81q0-40-16-70t-45-46-61-24-70-8q-28 0-74 7 0 28 2 86t2 86q0 15-0 45t-0 45q0 26 0 39zM0 950l1-53q8-2 48-9t60-15q4-6 7-15t4-19 3-18 1-21 0-19v-37q0-561-12-585-2-4-12-8t-25-6-28-4-27-2-17-1l-2-47q56-1 194-6t213-5q13 0 39 0t38 0q40 0 78 7t73 24 61 40 42 59 16 78q0 29-9 54t-22 41-36 32-41 25-48 22q88 20 146 76t58 141q0 57-20 102t-53 74-78 48-93 27-100 8q-25 0-75-1t-75-1q-60 0-175 6t-132 6z"
        }
          , emIcon = {
            type: "icon",
            width: 585,
            height: 1024,
            path: "M0 949l9-48q3-1 46-12t63-21q16-20 23-57 0-4 35-165t65-310 29-169v-14q-13-7-31-10t-39-4-33-3l10-58q18 1 68 3t85 4 68 1q27 0 56-1t69-4 56-3q-2 22-10 50-17 5-58 16t-62 19q-4 10-8 24t-5 22-4 26-3 24q-15 84-50 239t-44 203q-1 5-7 33t-11 51-9 47-3 32l0 10q9 2 105 17-1 25-9 56-6 0-18 0t-18 0q-16 0-49-5t-49-5q-78-1-117-1-29 0-81 5t-69 6z"
        }
          , noCommands = (exports.commands = _edit.CommandSet["default"].update({
            selectParentNode: {
                menu: null
            },
            lift: {
                menu: null
            },
            "code:toggle": {
                menu: {
                    group: "textblock",
                    rank: 99,
                    select: "disable",
                    display: {
                        type: "label",
                        label: "Code"
                    }
                }
            },
            "strong:toggle": {
                menu: {
                    group: "inline",
                    rank: 20,
                    select: "disable",
                    display: strongIcon
                }
            },
            "em:toggle": {
                menu: {
                    group: "inline",
                    rank: 21,
                    select: "disable",
                    display: emIcon
                }
            }
        }),
        exports.commentCommands = _edit.CommandSet["default"].update({
            selectParentNode: {
                menu: null
            },
            lift: {
                menu: null
            },
            "code:toggle": {
                menu: {
                    group: "textblock",
                    rank: 99,
                    select: "disable",
                    display: {
                        type: "label",
                        label: "Code"
                    }
                }
            },
            "strong:toggle": {
                menu: {
                    group: "inline",
                    rank: 20,
                    select: "disable",
                    display: strongIcon
                }
            },
            "em:toggle": {
                menu: {
                    group: "inline",
                    rank: 21,
                    select: "disable",
                    display: emIcon
                }
            },
            comment: _tool.commentCmdSpec
        }),
        exports.noCommands = new _edit.CommandSet(null,function() {
            return null
        }
        ));
        exports.commentOnlyCommands = noCommands.update({
            comment: _tool.commentCmdSpec
        }),
        exports.grammarCommands = _edit.CommandSet["default"].update({
            selectParentNode: {
                menu: null
            },
            lift: {
                menu: null
            },
            "code:toggle": {
                menu: {
                    group: "textblock",
                    rank: 99,
                    select: "disable",
                    display: {
                        type: "label",
                        label: "Code"
                    }
                }
            },
            "strong:toggle": {
                menu: {
                    group: "inline",
                    rank: 20,
                    select: "disable",
                    display: strongIcon
                }
            },
            "em:toggle": {
                menu: {
                    group: "inline",
                    rank: 21,
                    select: "disable",
                    display: emIcon
                }
            },
            analyze: _tool.analyzeCmdSpec
        });
        (0,
        _dom.insertCSS)('\n		\n.ProseMirror {\n}\n\n.ProseMirror-menu {\n	background: white;\n	color: black;\n}\n\ndiv.ProseMirror-dropdown-menu {\n  position: absolute;\n  background: white;\n  color: black;\n  border-radius: 6px;\n  border: 1px solid silver;\n  padding: 2px 2px;\n  z-index: 15;\n}\n\ndiv.ProseMirror-dropdown-menu {\n  cursor: pointer;\n  padding: 0 1em 0 2px;\n}\n\ndiv.ProseMirror-menubar-inner {\n  background: linear-gradient(to bottom, white, #0191C8);\n}\n\ndiv.ProseMirror-menu form {\n	background: linear-gradient(to bottom, white, #0191C8);\n	width: 300px;\n}\n\ndiv.ProseMirror-menu form select {\n	width: 100px;\n	background: white;\n}\n\ndiv.ProseMirror-menu input[type = "text"] {\n	background: white;\n}\n\n')
    }
    , {
        "./widgets": 78,
        "./widgets/content": 71,
        "./widgets/input": 80,
        "./widgets/questions": 88,
        "./widgets/tool": 97,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/edit": 11,
        "prosemirror/dist/menu/menu": 28,
        "prosemirror/dist/model": 34
    }],
    65: [function(require, module, exports) {
        "use strict";
        function defParser(type, tag, cls) {
            type.register("parseDOM", tag, {
                parse: function(dom, state) {
                    if (!dom.classList.contains(cls))
                        return !1;
                    var attrs = Object.create(null);
                    for (var name in this.attrs)
                        attrs[name] = dom.getAttribute(name);
                    state.wrapIn(dom, this, attrs)
                }
            })
        }
        function getID() {
            return Math.floor(4294967295 * Math.random())
        }
        function addDropListeners(pm) {
            pm.content.addEventListener("drop", function(e) {
                return !1
            })
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var _params = require("./params");
        Object.defineProperty(exports, "widgetParamHandler", {
            enumerable: !0,
            get: function() {
                return _params.widgetParamHandler
            }
        }),
        Object.defineProperty(exports, "defineFileHandler", {
            enumerable: !0,
            get: function() {
                return _params.defineFileHandler
            }
        }),
        Object.defineProperty(exports, "namePattern", {
            enumerable: !0,
            get: function() {
                return _params.namePattern
            }
        }),
        Object.defineProperty(exports, "nameTitle", {
            enumerable: !0,
            get: function() {
                return _params.nameTitle
            }
        }),
        Object.defineProperty(exports, "defParamsClick", {
            enumerable: !0,
            get: function() {
                return _params.defParamsClick
            }
        }),
        Object.defineProperty(exports, "selectedNodeAttr", {
            enumerable: !0,
            get: function() {
                return _params.selectedNodeAttr
            }
        }),
        exports.defParser = defParser,
        exports.getID = getID,
        exports.addDropListeners = addDropListeners;
        exports.onResize = require("prosemirror/node_modules/element-resize-event/index.js")
    }
    , {
        "./params": 66,
        "prosemirror/node_modules/element-resize-event/index.js": 58
    }],
    66: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function");
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function defineFileHandler(handler) {
            fhandler = handler
        }
        function getLastClicked() {
            return lastClicked
        }
        function openWidgetPrompt(wpp, options) {
            var close = function close() {
                wpp.pm.off("interaction", close),
                dialog.parentNode && (dialog.parentNode.removeChild(dialog),
                options && options.onClose && options.onClose())
            }
              , submit = function() {
                var params = wpp.values();
                params && (wpp.command.exec(wpp.pm, params),
                close())
            };
            wpp.pm.on("interaction", close);
            var save = (0,
            _dom.elt)("input", {
                name: "save",
                type: "button",
                value: "Save"
            });
            save.addEventListener("mousedown", function(e) {
                submit()
            });
            var cancel = (0,
            _dom.elt)("input", {
                name: "cancel",
                type: "button",
                value: "Cancel"
            });
            cancel.addEventListener("mousedown", function(e) {
                e.preventDefault(),
                e.stopPropagation(),
                close()
            });
            var buttons = (0,
            _dom.elt)("div", {
                "class": "widgetButtons"
            }, save, cancel);
            wpp.form = (0,
            _dom.elt)("form", {
                "class": "widgetForm"
            }, (0,
            _dom.elt)("h4", null, wpp.command.label + " Settings"), wpp.fields.map(function(f) {
                return (0,
                _dom.elt)("div", null, f)
            }), buttons),
            wpp.form.addEventListener("keypress", function(e) {
                13 == e.keyCode && (e.preventDefault(),
                e.stopPropagation(),
                save.click())
            });
            var dialog = (0,
            _dom.elt)("div", null, (0,
            _dom.elt)("div", {
                "class": "widgetDialog"
            }), wpp.form);
            return wpp.pm.wrapper.appendChild(dialog),
            {
                close: close
            }
        }
        function defParamsClick(type, cmdname) {
            var spots = arguments.length <= 2 || void 0 === arguments[2] ? ["topright"] : arguments[2];
            type.prototype.handleClick = function(pm, e, pos, node) {
                e.preventDefault(),
                pm.setNodeSelection(pos),
                pm.focus(),
                lastClicked = e.target;
                var spotClicked = !1;
                if (spots.forEach(function(loc) {
                    var r = e.target.getBoundingClientRect();
                    "all" == loc ? spotClicked = !0 : "topright" == loc ? spotClicked = spotClicked || e.clientX > r.right - 16 && e.clientY < r.top + 16 : "topleft" == loc ? spotClicked = spotClicked || e.clientX < r.left + 16 && e.clientY < r.top + 16 : "bottomright" == loc && (spotClicked = spotClicked || e.clientX > r.right - 32 && e.clientY > r.bottom - 32)
                }),
                spotClicked) {
                    var cmd = pm.commands[cmdname];
                    return cmd ? (cmd.exec(pm),
                    !0) : !1
                }
            }
        }
        function selectedNodeAttr(pm, type, name) {
            var node = pm.selection.node;
            return node && node.type == type ? node.attrs[name] : void 0
        }
        function FileDragHover(e) {
            e.stopPropagation(),
            e.preventDefault(),
            e.target.className = "dragover" == e.type ? "hover" : ""
        }
        function buildUploadForm(pm, field) {
            var legend = (0,
            _dom.elt)("h4", null, "File Upload")
              , label = ((0,
            _dom.elt)("input", {
                type: "hidden",
                id: "MAX_FILE_SIZE",
                name: "MAX_FILE_SIZE",
                value: "300000"
            }),
            (0,
            _dom.elt)("label", {
                "for": "fileselect"
            }, "File to upload:"))
              , fileselect = (0,
            _dom.elt)("input", {
                id: "fileselect",
                type: "file",
                name: "fileselect[]",
                multiple: "multiple"
            })
              , filedrag = (0,
            _dom.elt)("div", {
                id: "filedrag"
            }, "or drop files here")
              , cancel = (0,
            _dom.elt)("input", {
                type: "button",
                value: "Cancel"
            });
            cancel.addEventListener("click", function(e) {
                e.preventDefault(),
                e.stopPropagation(),
                pm.wrapper.removeChild(form)
            });
            var saveFile = function(e) {
                e.preventDefault(),
                e.stopPropagation(),
                FileDragHover(e);
                var files = e.target.files || e.dataTransfer.files;
                files && (field.value = files[0].name),
                fhandler && fhandler(files),
                pm.wrapper.removeChild(form)
            };
            fileselect.addEventListener("change", saveFile);
            var xhr = new XMLHttpRequest;
            xhr.upload && (filedrag.addEventListener("dragover", FileDragHover),
            filedrag.addEventListener("dragleave", FileDragHover),
            filedrag.addEventListener("drop", saveFile),
            filedrag.style.display = "block");
            var form = (0,
            _dom.elt)("form", {
                id: "upload",
                enctype: "multipart/form-data"
            }, legend, (0,
            _dom.elt)("div", null, label, fileselect, filedrag), (0,
            _dom.elt)("div", null, cancel));
            pm.wrapper.appendChild(form)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.nameTitle = exports.namePattern = void 0,
        exports.defineFileHandler = defineFileHandler,
        exports.getLastClicked = getLastClicked,
        exports.defParamsClick = defParamsClick,
        exports.selectedNodeAttr = selectedNodeAttr;
        var _dom = require("prosemirror/dist/dom")
          , _prompt = require("prosemirror/dist/ui/prompt")
          , _edit = require("prosemirror/dist/edit")
          , fhandler = (require("prosemirror/dist/edit/dompos"),
        require("prosemirror/dist/util/error"),
        null)
          , lastClicked = null
          , WidgetParamPrompt = (exports.namePattern = "[A-Za-z0-9_-]{1,10}",
        exports.nameTitle = "letters,digits, -, _ (max:10)",
        function(_ParamPrompt) {
            function WidgetParamPrompt() {
                return _classCallCheck(this, WidgetParamPrompt),
                _possibleConstructorReturn(this, Object.getPrototypeOf(WidgetParamPrompt).apply(this, arguments))
            }
            return _inherits(WidgetParamPrompt, _ParamPrompt),
            _createClass(WidgetParamPrompt, [{
                key: "prompt",
                value: function() {
                    var _this2 = this;
                    return openWidgetPrompt(this, {
                        onClose: function() {
                            return _this2.close()
                        }
                    })
                }
            }]),
            WidgetParamPrompt
        }(_prompt.ParamPrompt));
        (0,
        _edit.defineOption)("commandParamPrompt", WidgetParamPrompt),
        ["text", "number", "range", "email", "url", "date"].map(function(type) {
            return _prompt.ParamPrompt.prototype.paramTypes[type] = {
                render: function(param, value) {
                    var field = (0,
                    _dom.elt)("input", {
                        type: type,
                        placeholder: param.label,
                        value: value,
                        required: "required",
                        autocomplete: "off"
                    })
                      , label = param.name ? param.name : param.label;
                    field.setAttribute("name", label);
                    var opt = param.options;
                    if (opt)
                        for (var prop in opt)
                            "required" == prop ? field.removeAttribute(prop) : field.setAttribute(prop, opt[prop]);
                    var fieldLabel = (0,
                    _dom.elt)("label", {
                        "for": label
                    }, label);
                    return (0,
                    _dom.elt)("div", {
                        "class": "widgetField"
                    }, fieldLabel, field)
                },
                validate: function(dom) {
                    var input = dom.querySelector("input");
                    return input.checkValidity() ? null : input.name + ": " + input.validationMessage
                },
                read: function(dom) {
                    var input = dom.querySelector("input");
                    return input ? input.value : input
                }
            }
        }),
        _prompt.ParamPrompt.prototype.paramTypes.file = {
            render: function(param, value) {
                var field = (0,
                _dom.elt)("input", {
                    type: "text",
                    readonly: !0,
                    placeholder: param.label,
                    value: value,
                    required: "required",
                    autocomplete: "off"
                })
                  , label = param.name ? param.name : param.label;
                field.setAttribute("name", label);
                var opt = param.options;
                if (opt)
                    for (var prop in opt)
                        field.setAttribute(prop, opt[prop]);
                var fieldLabel = (0,
                _dom.elt)("label", {
                    "for": label
                }, label)
                  , uploadButton = (0,
                _dom.elt)("input", {
                    name: "upload",
                    type: "button",
                    value: "Upload"
                });
                return uploadButton.addEventListener("click", function(e) {
                    buildUploadForm(pm, field)
                }),
                (0,
                _dom.elt)("div", {
                    "class": "widgetField"
                }, fieldLabel, field, uploadButton)
            },
            validate: function(dom) {
                var input = dom.querySelector("input");
                return input.checkValidity() ? null : input.name + ": " + input.validationMessage
            },
            read: function(dom) {
                var input = dom.querySelector("input");
                return input ? input.value : input
            }
        },
        _prompt.ParamPrompt.prototype.paramTypes.select = {
            render: function(param, value) {
                var options = param.options.call ? param.options(this) : param.options
                  , field = (0,
                _dom.elt)("select", null, options.map(function(o) {
                    return (0,
                    _dom.elt)("option", {
                        value: o.value,
                        selected: o.value == value ? "true" : null
                    }, o.label)
                }));
                field.setAttribute("required", "required");
                var label = param.name ? param.name : param.label;
                field.setAttribute("name", label);
                var fieldLabel = (0,
                _dom.elt)("label", {
                    "for": name
                }, label);
                return (0,
                _dom.elt)("div", {
                    "class": "widgetField"
                }, fieldLabel, field)
            },
            validate: function(dom) {
                var select = dom.querySelector("select");
                return select.checkValidity() ? null : select.name + ": " + select.validationMessage
            },
            read: function(dom) {
                var select = dom.querySelector("select");
                return select ? select.value : select
            }
        },
        (0,
        _dom.insertCSS)('\n\n.widgetDialog {\n	position: absolute;\n	top: 0;\n	left: 0;\n	width: 100%;\n	height: 100%;\n	background: #FFF;\n	z-index: 8888;\n	opacity:0.7;\n}\n\n.widgetForm {\n	font-family: Helvetica, Arial, Sans-Serif;\n	font-size: 80%;\n	background: white;\n	position: absolute;\n	top: 10px;\n	left: 10px;\n	z-index: 9999;\n	display: block;\n	border-radius: 6px;\n	border: 1px solid #AAA;\n	padding: 4px;\n}\n\n.widgetForm h4 {\n	margin: 0;\n}\n\n.widgetField {\n	display: block;\n	padding: 2px;\n}\n\n.widgetField label {\n	width: 80px;\n	color: black;\n	display: inline-block;\n	padding: 2px;\n	float: left;\n}\n\n.widgetField input {\n	margin: 2px;\n	display: inline;\n}\n\n.widgetField input[type = "number"] {\n	width: 60px;\n	margin: 2px;\n	display: inline;\n}\n\n.widgetField input[type = "button"] {\n	margin: 5px;\n}\n\n.widgetFieldName {\n	color: black;\n	display: inline;\n	padding: 4px;\n}\n\n.widgetButtons {\n	text-align: center;\n	display: inline-block;\n	white-space: nowrap;\n}\n\n.widgetButtons input {\n	margin: 5px;\n}\n\n#upload {\n	position: absolute;\n	top: 40px;\n	left: 40px;\n	padding: 5px;\n	border: 1px solid #AAA;\n	border-radius: 6px;\n	background: white;\n	z-index: 10000;\n	display: block;\n}\n\n#upload input {\n	margin: 5px;\n}\n\n#upload h4 {\n	margin: 0;\n}\n\n#filedrag {\n	display: none;\n	font-weight: bold;\n	text-align: center;\n	padding: 1em 0;\n	margin: 1em 0;\n	color: #555;\n	border: 2px dashed #555;\n	border-radius: 6px;\n	cursor: default;\n}\n\n#filedrag:hover {\n	color: #f00;\n	border-color: #f00;\n	border-style: solid;\n	box-shadow: inset 0 3px 4px #888;\n}\n\n.ProseMirror-invalid {\n	  white-space: nowrap;\n	  font-size: 80%;\n	  background: white;\n	  border: 1px solid red;\n	  border-radius: 4px;\n	  padding: 5px 10px;\n	  position: absolute;\n	  min-width: 10em;\n	}\n\n')
    }
    , {
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/edit": 11,
        "prosemirror/dist/edit/dompos": 8,
        "prosemirror/dist/ui/prompt": 49,
        "prosemirror/dist/util/error": 52
    }],
    67: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.BlockMath = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , _index = require("./index")
          , css = "widgets-blockmath"
          , BlockMath = exports.BlockMath = function(_Block) {
            function BlockMath() {
                return _classCallCheck(this, BlockMath),
                _possibleConstructorReturn(this, Object.getPrototypeOf(BlockMath).apply(this, arguments))
            }
            return _inherits(BlockMath, _Block),
            _createClass(BlockMath, [{
                key: "attrs",
                get: function() {
                    return {
                        tex: new _model.Attribute
                    }
                }
            }, {
                key: "contains",
                get: function() {
                    return null
                }
            }]),
            BlockMath
        }(_model.Block);
        (0,
        _utils.defParser)(BlockMath, "div", css),
        BlockMath.prototype.serializeDOM = function(node) {
            return node.rendered ? node.rendered = node.rendered.cloneNode(!0) : (node.rendered = (0,
            _dom.elt)("div", {
                "class": css + " widgets-edit"
            }, "\\[" + node.attrs.tex + "\\]"),
            MathJax.Hub.Queue(["Delay", MathJax.Callback, 100], ["Typeset", MathJax.Hub, node.rendered])),
            node.rendered
        }
        ,
        BlockMath.register("command", "insert", {
            label: "BlockMath",
            run: function(pm, tex) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , node = (_pm$selection.to,
                _pm$selection.node);
                if (node && node.type == this) {
                    var tr = pm.tr.setNodeType(from, this, {
                        tex: tex
                    }).apply();
                    return tr
                }
                return (0,
                _index.insertWidget)(pm, from, this.create({
                    tex: tex
                }))
            },
            select: function(pm) {
                return !0
            },
            menu: {
                group: "content",
                rank: 72,
                display: {
                    type: "label",
                    label: "Block Math"
                }
            },
            params: [{
                name: "Latex",
                attr: "tex",
                label: "Latex Expression",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "tex")
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(BlockMath, "blockmath:insert"),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + " {\n	display: inline-block;\n}\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./index": 71,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    68: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function getCarryOptions(names) {
            return names.map(function(w) {
                return {
                    value: w,
                    label: w
                }
            })
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.CarryForward = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , css = "widgets-carryforward"
          , CarryForward = exports.CarryForward = function(_Inline) {
            function CarryForward() {
                return _classCallCheck(this, CarryForward),
                _possibleConstructorReturn(this, Object.getPrototypeOf(CarryForward).apply(this, arguments))
            }
            return _inherits(CarryForward, _Inline),
            _createClass(CarryForward, [{
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        model: new _model.Attribute({
                            "default": "user_response"
                        }),
                        type: new _model.Attribute({
                            "default": "carry_forward"
                        }),
                        "class": new _model.Attribute({
                            "default": css + " widgets-edit"
                        })
                    }
                }
            }]),
            CarryForward
        }(_model.Inline);
        (0,
        _utils.defParser)(CarryForward, "thinkspace", css),
        CarryForward.prototype.serializeDOM = function(node) {
            return (0,
            _dom.elt)("thinkspace", node.attrs, (0,
            _dom.elt)("img", {
                src: "icons/forward.png",
                width: 16,
                height: 16,
                title: "Carry forward " + node.attrs.name
            }))
        }
        ,
        CarryForward.register("command", "insert", {
            derive: {
                params: [{
                    name: "Name",
                    attr: "name",
                    label: "Element name",
                    type: "select",
                    prefill: function(pm) {
                        return (0,
                        _utils.selectedNodeAttr)(pm, this, "name")
                    },
                    options: function() {
                        return getCarryOptions(["test1", "test2"])
                    }
                }]
            },
            label: "CarryForward",
            menu: {
                group: "insert",
                rank: 73,
                select: "disable",
                display: {
                    type: "label",
                    label: "Carry Forward"
                }
            }
        }),
        (0,
        _utils.defParamsClick)(CarryForward, "carryforward:insert", ["all"]),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + " img:hover {\n	cursor: pointer;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    69: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function getFileData(url, f) {
            var xmlhttp = new XMLHttpRequest;
            xmlhttp.onreadystatechange = function() {
                4 == xmlhttp.readyState && 200 == xmlhttp.status && f(xmlhttp.responseText)
            }
            ,
            xmlhttp.open("GET", url, !0),
            xmlhttp.send()
        }
        function makeGraph(id, url) {
            getFileData(url, function(data) {
                var graph = JSON.parse(data);
                "map" == graph.type ? getFileData("maps/" + graph.dataProvider.map + ".js", function(script) {
                    eval.apply(window, [script]),
                    AmCharts.makeChart(id, graph)
                }) : AmCharts.makeChart(id, graph)
            })
        }
        function getGraphOptions() {
            return graphs.map(function(w) {
                return {
                    value: w,
                    label: w
                }
            })
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Graph = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , _index = require("./index")
          , css = "widgets-graph"
          , graphs = ["graphs/line.json", "graphs/column.json", "graphs/pie.json", "graphs/gantt.json", "maps/map.json"]
          , Graph = exports.Graph = function(_Block) {
            function Graph() {
                return _classCallCheck(this, Graph),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Graph).apply(this, arguments))
            }
            return _inherits(Graph, _Block),
            _createClass(Graph, [{
                key: "attrs",
                get: function() {
                    return {
                        data: new _model.Attribute({
                            "default": ""
                        }),
                        size: new _model.Attribute({
                            "default": "medium"
                        })
                    }
                }
            }, {
                key: "contains",
                get: function() {
                    return null
                }
            }]),
            Graph
        }(_model.Block);
        (0,
        _utils.defParser)(Graph, "div", css),
        Graph.prototype.serializeDOM = function(node) {
            if (node.rendered)
                node.rendered = node.rendered.cloneNode(!0);
            else {
                var id = (0,
                _utils.getID)();
                node.rendered = (0,
                _dom.elt)("div", {
                    "class": css + " widgets-graph-" + node.attrs.size,
                    id: id
                }),
                makeGraph(id, node.attrs.data)
            }
            return node.rendered
        }
        ,
        Graph.register("command", "insert", {
            label: "Graph",
            run: function(pm, data, size) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , node = (_pm$selection.to,
                _pm$selection.node);
                if (console.log(data, size),
                node && node.type == this) {
                    var tr = pm.tr.setNodeType(from, this, {
                        data: data,
                        size: size
                    }).apply();
                    return tr
                }
                return (0,
                _index.insertWidget)(pm, from, this.create({
                    data: data,
                    size: size
                }))
            },
            select: function(pm) {
                return !0
            },
            menu: {
                group: "content",
                rank: 74,
                display: {
                    type: "label",
                    label: "Graph/Map"
                }
            },
            params: [{
                name: "Data URL",
                attr: "data",
                label: "Data URL",
                type: "select",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "data")
                },
                options: function() {
                    return getGraphOptions()
                }
            }, {
                name: "Size",
                attr: "size",
                label: "Size",
                type: "select",
                "default": "medium",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "size")
                },
                options: [{
                    value: "small",
                    label: "small"
                }, {
                    value: "medium",
                    label: "medium"
                }, {
                    value: "large",
                    label: "large"
                }]
            }]
        }),
        (0,
        _utils.defParamsClick)(Graph, "graph:insert"),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror .{css} {}\n\n." + css + "-small {\n	border-radius: 6px;\n	border: 1px solid #DDD;\n	width: 400px;\n    height: 300px;\n	display: inline-block;\n}\n\n." + css + "-medium {\n	border-radius: 6px;\n	border: 1px solid #DDD;\n	width: 600px;\n    height: 400px;\n	display: inline-block;\n}\n\n." + css + "-large {\n	border-radius: 6px;\n	border: 1px solid #DDD;\n	width: 800px;\n    height: 600px;\n	display: inline-block;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./index": 71,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    70: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Image = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , css = "widgets-img"
          , Image = exports.Image = function(_Inline) {
            function Image() {
                return _classCallCheck(this, Image),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Image).apply(this, arguments))
            }
            return _inherits(Image, _Inline),
            _createClass(Image, [{
                key: "attrs",
                get: function() {
                    return {
                        src: new _model.Attribute,
                        alt: new _model.Attribute,
                        title: new _model.Attribute,
                        "class": new _model.Attribute({
                            "default": css + " widgets-edit"
                        })
                    }
                }
            }]),
            Image
        }(_model.Inline);
        (0,
        _utils.defParser)(Image, "img", css),
        Image.prototype.serializeDOM = function(node, s) {
            return s.renderAs(node, "img", node.attrs)
        }
        ,
        Image.register("command", "insert", {
            derive: {
                params: [{
                    name: "File",
                    attr: "src",
                    label: "Image File",
                    type: "file",
                    "default": "img.png",
                    prefill: function(pm) {
                        return (0,
                        _utils.selectedNodeAttr)(pm, this, "src")
                    }
                }, {
                    name: "Description",
                    attr: "alt",
                    label: "Description / alternative text",
                    type: "text",
                    prefill: function(pm) {
                        return (0,
                        _utils.selectedNodeAttr)(pm, this, "alt")
                    }
                }, {
                    name: "Title",
                    attr: "title",
                    label: "Title",
                    type: "text",
                    prefill: function(pm) {
                        return (0,
                        _utils.selectedNodeAttr)(pm, this, "title")
                    }
                }]
            },
            label: "Image",
            menu: {
                group: "insert",
                rank: 70,
                select: "disable",
                display: {
                    type: "label",
                    label: "Image"
                }
            }
        }),
        (0,
        _utils.defParamsClick)(Image, "image:insert", ["all"]),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror .{$css} {}\n\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    71: [function(require, module, exports) {
        "use strict";
        function getBlockPos(pm, $pos) {
            for (var i = $pos.depth; i > 0; i--)
                if ($pos.node(i).type instanceof _model.Block)
                    return $pos.end(i);
            return $pos.end(0)
        }
        function insertWidget(pm, pos, w) {
            var $pos = pm.doc.resolve(pos);
            return pm.tr.insert(getBlockPos(pm, $pos), w).apply(pm.apply.scroll)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Graph = exports.CarryForward = exports.SpreadSheet = exports.Image = exports.InlineMath = exports.Website = exports.BlockMath = void 0;
        var _blockmath = require("./blockmath");
        Object.defineProperty(exports, "BlockMath", {
            enumerable: !0,
            get: function() {
                return _blockmath.BlockMath
            }
        });
        var _website = require("./website");
        Object.defineProperty(exports, "Website", {
            enumerable: !0,
            get: function() {
                return _website.Website
            }
        });
        var _inlinemath = require("./inlinemath");
        Object.defineProperty(exports, "InlineMath", {
            enumerable: !0,
            get: function() {
                return _inlinemath.InlineMath
            }
        });
        var _image = require("./image");
        Object.defineProperty(exports, "Image", {
            enumerable: !0,
            get: function() {
                return _image.Image
            }
        });
        var _spreadsheet = require("./spreadsheet");
        Object.defineProperty(exports, "SpreadSheet", {
            enumerable: !0,
            get: function() {
                return _spreadsheet.SpreadSheet
            }
        });
        var _carryforward = require("./carryforward");
        Object.defineProperty(exports, "CarryForward", {
            enumerable: !0,
            get: function() {
                return _carryforward.CarryForward
            }
        });
        var _graph = require("./graph");
        Object.defineProperty(exports, "Graph", {
            enumerable: !0,
            get: function() {
                return _graph.Graph
            }
        }),
        exports.insertWidget = insertWidget;
        var _model = require("prosemirror/dist/model");
        window.MathJax && MathJax.Hub.Queue(function() {
            MathJax.Hub.Config({
                tex2jax: {
                    displayMath: [["\\[", "\\]"]],
                    inlineMath: [["\\(", "\\)"]],
                    processEscapes: !0
                },
                displayAlign: "left"
            })
        })
    }
    , {
        "./blockmath": 67,
        "./carryforward": 68,
        "./graph": 69,
        "./image": 70,
        "./inlinemath": 72,
        "./spreadsheet": 73,
        "./website": 74,
        "prosemirror/dist/model": 34
    }],
    72: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.InlineMath = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , css = "widgets-inlinemath"
          , InlineMath = exports.InlineMath = function(_Inline) {
            function InlineMath() {
                return _classCallCheck(this, InlineMath),
                _possibleConstructorReturn(this, Object.getPrototypeOf(InlineMath).apply(this, arguments))
            }
            return _inherits(InlineMath, _Inline),
            _createClass(InlineMath, [{
                key: "attrs",
                get: function() {
                    return {
                        tex: new _model.Attribute
                    }
                }
            }, {
                key: "contains",
                get: function() {
                    return null
                }
            }]),
            InlineMath
        }(_model.Inline);
        (0,
        _utils.defParser)(InlineMath, "span", css),
        InlineMath.prototype.serializeDOM = function(node) {
            return node.rendered ? node.rendered = node.rendered.cloneNode(!0) : (node.rendered = (0,
            _dom.elt)("span", {
                "class": css + " widgets-edit"
            }, " \\(" + node.attrs.tex + "\\) "),
            MathJax.Hub.Queue(["Delay", MathJax.Callback, 100], ["Typeset", MathJax.Hub, node.rendered])),
            node.rendered
        }
        ,
        InlineMath.register("command", "insert", {
            derive: {
                params: [{
                    name: "Latex",
                    attr: "tex",
                    label: "Latex Expression",
                    type: "text",
                    prefill: function(pm) {
                        return (0,
                        _utils.selectedNodeAttr)(pm, this, "tex")
                    }
                }]
            },
            label: "InlineMath",
            menu: {
                group: "insert",
                rank: 71,
                select: "disable",
                display: {
                    type: "label",
                    label: "Inline Math"
                }
            }
        }),
        (0,
        _utils.defParamsClick)(InlineMath, "inlinemath:insert"),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + " {}\n\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    73: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.SpreadSheet = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , _index = require("./index")
          , css = "widgets-spreadsheet"
          , SpreadSheet = exports.SpreadSheet = function(_Block) {
            function SpreadSheet() {
                return _classCallCheck(this, SpreadSheet),
                _possibleConstructorReturn(this, Object.getPrototypeOf(SpreadSheet).apply(this, arguments))
            }
            return _inherits(SpreadSheet, _Block),
            _createClass(SpreadSheet, [{
                key: "attrs",
                get: function() {
                    return {
                        data: new _model.Attribute
                    }
                }
            }, {
                key: "contains",
                get: function() {
                    return null
                }
            }]),
            SpreadSheet
        }(_model.Block);
        (0,
        _utils.defParser)(SpreadSheet, "div", css),
        SpreadSheet.prototype.serializeDOM = function(node) {
            return node.rendered ? node.rendered = node.rendered.cloneNode(!0) : (node.rendered = (0,
            _dom.elt)("div", {
                "class": css + " widgets-edit"
            }),
            window.setTimeout(function() {
                var data = [["", "Ford", "Volvo", "Toyota", "Honda"], ["2014", 10, 11, 12, 13], ["2015", 20, 11, 14, 13], ["2016", 30, 15, 12, 13]];
                new Handsontable(node.rendered,{
                    data: data,
                    minSpareRows: 1,
                    rowHeaders: !0,
                    colHeaders: !0,
                    contextMenu: !0
                })
            }, 100)),
            node.rendered
        }
        ,
        SpreadSheet.register("command", "insert", {
            label: "SpreadSheet",
            run: function(pm, data) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , node = (_pm$selection.to,
                _pm$selection.node);
                if (node && node.type == this) {
                    var tr = pm.tr.setNodeType(from, this, {
                        data: data
                    }).apply();
                    return tr
                }
                return (0,
                _index.insertWidget)(pm, from, this.create({
                    data: data
                }))
            },
            select: function(pm) {
                return !0
            },
            menu: {
                group: "content",
                rank: 75,
                select: "disable",
                display: {
                    type: "label",
                    label: "Spreadsheet"
                }
            },
            params: [{
                name: "Data Link",
                attr: "data",
                label: "Link to CSV (fixed for demo)",
                type: "file",
                "default": "cars.csv",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "data")
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(SpreadSheet, "spreadsheet:insert", ["all"]),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + " {\n	display: inline-block;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./index": 71,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    74: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Website = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , _index = require("./index")
          , css = "widgets-website"
          , Website = exports.Website = function(_Block) {
            function Website() {
                return _classCallCheck(this, Website),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Website).apply(this, arguments))
            }
            return _inherits(Website, _Block),
            _createClass(Website, [{
                key: "attrs",
                get: function() {
                    return {
                        src: new _model.Attribute,
                        width: new _model.Attribute({
                            "default": 200
                        }),
                        height: new _model.Attribute({
                            "default": 200
                        })
                    }
                }
            }, {
                key: "contains",
                get: function() {
                    return null
                }
            }]),
            Website
        }(_model.Block);
        (0,
        _utils.defParser)(Website, "website", css),
        Website.prototype.serializeDOM = function(node, s) {
            return s.renderAs(node, "iframe", {
                src: node.attrs.src,
                width: node.attrs.width,
                height: node.attrs.height,
                content: "text/html;charset=UTF-8",
                "class": css + " widgets-edit",
                frameborder: "1",
                allowfullscreen: "1"
            })
        }
        ,
        Website.register("command", "insert", {
            label: "Website",
            run: function(pm, src, width, height) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , node = (_pm$selection.to,
                _pm$selection.node);
                if (node && node.type == this) {
                    var tr = pm.tr.setNodeType(from, this, {
                        src: src,
                        width: width,
                        height: height
                    }).apply();
                    return tr
                }
                return (0,
                _index.insertWidget)(pm, from, this.create({
                    src: src,
                    width: width,
                    height: height
                }))
            },
            select: function(pm) {
                return !0
            },
            menu: {
                group: "content",
                rank: 74,
                select: "disable",
                display: {
                    type: "label",
                    label: "Website"
                }
            },
            params: [{
                name: "URL",
                attr: "src",
                label: "Link to website, youTube, Google Maps ...",
                type: "url",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "src")
                }
            }, {
                name: "Width",
                attr: "width",
                label: "Width in pixels",
                type: "number",
                "default": 400,
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "width")
                },
                options: {
                    min: 50,
                    height: 800
                }
            }, {
                name: "Height",
                attr: "height",
                label: "Height in pixels",
                type: "number",
                "default": 400,
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "height")
                },
                options: {
                    min: 50,
                    height: 800
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(Website, "website:insert"),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + " {\n	border: 1px solid red;\n    padding-top: 16px;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./index": 71,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    75: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function getTextblockDepth(pm, $pos) {
            for (var i = $pos.depth; i > 0; i--)
                if ($pos.node(i).type instanceof _model.Textblock)
                    return i;
            return 0
        }
        function findAlignWrapper(pm, align) {
            var _pm$selection = pm.selection
              , from = _pm$selection.from
              , to = _pm$selection.to
              , $from = (_pm$selection.node,
            pm.doc.resolve(from))
              , $to = pm.doc.resolve(to)
              , isLeft = "leftalign" == align.name
              , depth = getTextblockDepth(pm, $from);
            if (depth > 0 && $from.node(depth - 1).type instanceof Align) {
                var tr = pm.tr.lift($from.start(depth), $from.end(depth)).apply(pm.apply.scroll);
                return isLeft || (tr = pm.tr.wrap($from.start(depth), $from.end(depth), align, {
                    "class": align.style
                }).apply(pm.apply.scroll)),
                tr
            }
            if (isLeft)
                return !1;
            var $end = from == to ? $from : $to;
            return pm.tr.wrap($from.start(depth), $end.end(depth), align, {
                "class": align.style
            }).apply(pm.apply.scroll)
        }
        function alignApplies(pm, type) {
            var _pm$selection2 = pm.selection
              , from = _pm$selection2.from
              , $from = (_pm$selection2.to,
            _pm$selection2.node,
            pm.doc.resolve(from))
              , isLeft = "leftalign" == type.name
              , index = getTextblockDepth(pm, $from);
            return isLeft && 0 == index ? !0 : $from.parent.type.name == type.name
        }
        function defAlign(type, label, path) {
            type.register("command", "align", {
                run: function(pm) {
                    return findAlignWrapper(pm, this)
                },
                active: function(pm) {
                    return alignApplies(pm, this)
                },
                label: label,
                menu: {
                    group: "align",
                    rank: 51,
                    display: {
                        type: "icon",
                        width: 8,
                        height: 8,
                        path: path
                    }
                }
            })
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.RightAlign = exports.CenterAlign = exports.LeftAlign = exports.alignGroup = void 0;
        var _menu = require("prosemirror/dist/menu/menu")
          , _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = (require("prosemirror/dist/transform"),
        require("../../utils"))
          , Align = function(_Block) {
            function Align() {
                return _classCallCheck(this, Align),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Align).apply(this, arguments))
            }
            return _inherits(Align, _Block),
            _createClass(Align, [{
                key: "attrs",
                get: function() {
                    return {
                        "class": new _model.Attribute({
                            "default": "widgets-leftalign"
                        })
                    }
                }
            }]),
            Align
        }(_model.Block);
        Align.prototype.serializeDOM = function(node, s) {
            return s.renderAs(node, "div", node.attrs)
        }
        ;
        var LeftAlign = (exports.alignGroup = new _menu.MenuCommandGroup("align"),
        exports.LeftAlign = function(_Align) {
            function LeftAlign() {
                return _classCallCheck(this, LeftAlign),
                _possibleConstructorReturn(this, Object.getPrototypeOf(LeftAlign).apply(this, arguments))
            }
            return _inherits(LeftAlign, _Align),
            _createClass(LeftAlign, [{
                key: "style",
                get: function() {
                    return "widgets-leftalign"
                }
            }]),
            LeftAlign
        }(Align))
          , CenterAlign = exports.CenterAlign = function(_Align2) {
            function CenterAlign() {
                return _classCallCheck(this, CenterAlign),
                _possibleConstructorReturn(this, Object.getPrototypeOf(CenterAlign).apply(this, arguments))
            }
            return _inherits(CenterAlign, _Align2),
            _createClass(CenterAlign, [{
                key: "style",
                get: function() {
                    return "widgets-centeralign"
                }
            }]),
            CenterAlign
        }(Align)
          , RightAlign = exports.RightAlign = function(_Align3) {
            function RightAlign() {
                return _classCallCheck(this, RightAlign),
                _possibleConstructorReturn(this, Object.getPrototypeOf(RightAlign).apply(this, arguments))
            }
            return _inherits(RightAlign, _Align3),
            _createClass(RightAlign, [{
                key: "style",
                get: function() {
                    return "widgets-rightalign"
                }
            }]),
            RightAlign
        }(Align);
        (0,
        _utils.defParser)(LeftAlign, "div", "icons/leftalign.png"),
        (0,
        _utils.defParser)(CenterAlign, "div", "widgets-centeralign"),
        (0,
        _utils.defParser)(RightAlign, "div", "widgets-rightalign"),
        defAlign(LeftAlign, "Left Align", "M0 0v1h8v-1h-8zm0 2v1h6v-1h-6zm0 2v1h8v-1h-8zm0 2v1h6v-1h-6z"),
        defAlign(CenterAlign, "Center Align", "M0 0v1h8v-1h-8zm1 2v1h6v-1h-6zm-1 2v1h8v-1h-8zm1 2v1h6v-1h-6z"),
        defAlign(RightAlign, "Right Align", "M0 0v1h8v-1h-8zm2 2v1h6v-1h-6zm-2 2v1h8v-1h-8zm2 2v1h6v-1h-6z"),
        (0,
        _dom.insertCSS)("\ndiv.widgets-leftalign {\n	text-align: left;\n}\n\ndiv.widgets-centeralign {\n	text-align: center;\n	margin: 0 auto;\n}\n\ndiv.widgets-rightalign {\n	text-align: right;\n	float: right;\n}\n\ndiv.widgets-justifyalign {\n	text-align: justify;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/menu/menu": 28,
        "prosemirror/dist/model": 34,
        "prosemirror/dist/transform": 41
    }],
    76: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var _align = require("./align");
        Object.defineProperty(exports, "alignGroup", {
            enumerable: !0,
            get: function() {
                return _align.alignGroup
            }
        }),
        Object.defineProperty(exports, "LeftAlign", {
            enumerable: !0,
            get: function() {
                return _align.LeftAlign
            }
        }),
        Object.defineProperty(exports, "CenterAlign", {
            enumerable: !0,
            get: function() {
                return _align.CenterAlign
            }
        }),
        Object.defineProperty(exports, "RightAlign", {
            enumerable: !0,
            get: function() {
                return _align.RightAlign
            }
        });
        var _marks = require("./marks");
        Object.defineProperty(exports, "UnderlineMark", {
            enumerable: !0,
            get: function() {
                return _marks.UnderlineMark
            }
        }),
        Object.defineProperty(exports, "StrikeThroughMark", {
            enumerable: !0,
            get: function() {
                return _marks.StrikeThroughMark
            }
        })
    }
    , {
        "./align": 75,
        "./marks": 77
    }],
    77: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.StrikeThroughMark = exports.UnderlineMark = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , UnderlineMark = (require("../../utils"),
        exports.UnderlineMark = function(_MarkType) {
            function UnderlineMark() {
                return _classCallCheck(this, UnderlineMark),
                _possibleConstructorReturn(this, Object.getPrototypeOf(UnderlineMark).apply(this, arguments))
            }
            return _inherits(UnderlineMark, _MarkType),
            UnderlineMark
        }(_model.MarkType));
        UnderlineMark.prototype.serializeDOM = function(mark, s) {
            return s.elt("span", {
                style: "text-decoration: underline;"
            })
        }
        ,
        UnderlineMark.register("command", "set", {
            derive: !0,
            label: "Set underline"
        }),
        UnderlineMark.register("command", "unset", {
            derive: !0,
            label: "Unset underline"
        }),
        UnderlineMark.register("command", "toggle", {
            derive: !0,
            label: "Toggle underline",
            menu: {
                group: "inline",
                rank: 22,
                select: "disable",
                display: {
                    type: "icon",
                    width: 8,
                    height: 8,
                    path: "M1 0v4c0 1.1 1.12 2 2.5 2h.5c1.1 0 2-.9 2-2v-4h-1v4c0 .55-.45 1-1 1s-1-.45-1-1v-4h-2zm-1 7v1h7v-1h-7z"
                }
            },
            keys: ["Mod-U"]
        }),
        UnderlineMark.register("parseDOMStyle", "text-decoration", {
            parse: function(value, state, inner) {
                "underline" == value ? state.wrapMark(inner, this) : inner()
            }
        });
        var StrikeThroughMark = exports.StrikeThroughMark = function(_MarkType2) {
            function StrikeThroughMark() {
                return _classCallCheck(this, StrikeThroughMark),
                _possibleConstructorReturn(this, Object.getPrototypeOf(StrikeThroughMark).apply(this, arguments))
            }
            return _inherits(StrikeThroughMark, _MarkType2),
            StrikeThroughMark
        }(_model.MarkType);
        StrikeThroughMark.prototype.serializeDOM = function(mark, s) {
            return s.elt("span", {
                style: "text-decoration: line-through;"
            })
        }
        ,
        StrikeThroughMark.register("command", "set", {
            derive: !0,
            label: "Set strike-through"
        }),
        StrikeThroughMark.register("command", "unset", {
            derive: !0,
            label: "Unset strike-through"
        }),
        StrikeThroughMark.register("command", "toggle", {
            derive: !0,
            label: "Toggle strike-through",
            menu: {
                group: "inline",
                rank: 23,
                select: "disable",
                display: {
                    type: "icon",
                    width: 512,
                    height: 512,
                    path: "M100.382,486.283v-69.5c8.006,7.789,17.585,14.803,28.743,21.053c11.151,6.263,22.901,11.513,35.257,15.776  c12.349,4.276,24.756,7.578,37.217,9.934c12.467,2.368,23.974,3.54,34.526,3.54c36.454,0,63.664-6.908,81.638-20.711  c17.948-13.815,26.948-33.671,26.948-59.565c0-13.474-3.026-25.237-9.053-35.264s-14.329-19.157-24.921-27.395  c-10.593-8.237-23.132-16.145-37.605-23.737l-31.224-15.895H0v-53.895h149.289c-4.395-3.553-8.552-7.224-12.474-11.007  c-11.342-10.928-20.25-23.315-26.724-37.164c-6.474-13.842-9.71-30.086-9.71-48.73c0-22.829,5.105-42.685,15.322-59.56  c10.217-16.881,23.638-30.789,40.257-41.717c16.611-10.928,35.552-19.066,56.809-24.421C234.033,2.678,255.704,0,277.789,0  c50.29,0,86.974,6.625,110.026,19.875V86.23c-29.868-23.947-68.236-35.928-115.078-35.928c-12.954,0-25.908,1.388-38.855,4.151  c-12.954,2.776-24.48,7.303-34.586,13.585c-10.105,6.29-18.335,14.375-24.697,24.257c-6.361,9.882-9.546,21.935-9.546,36.151  c0,12.803,2.414,23.862,7.243,33.185c4.829,9.315,11.954,17.809,21.389,25.486c9.434,7.671,20.921,15.119,34.467,22.343  l41.73,21.164H512v53.895H359.395c3.474,2.961,6.816,5.987,10,9.093c12.29,11.907,22.014,25.065,29.211,39.46  c7.184,14.421,10.763,30.947,10.763,49.579c0,24.711-4.921,45.605-14.763,62.711c-9.843,17.104-23.105,31-39.79,41.71  c-16.71,10.711-35.947,18.435-57.776,23.185c-21.828,4.763-44.822,7.132-69,7.132l-29.861-2.079  c-11.829-1.382-23.921-3.396-36.27-6.053c-12.349-2.658-24.026-5.961-35.033-9.895C115.875,495.44,107.039,491.072,100.382,486.283z  "
                }
            },
            keys: ["Mod-S"]
        }),
        StrikeThroughMark.register("parseDOMStyle", "text-decoration", {
            parse: function(value, state, inner) {
                "line-through" == value ? state.wrapMark(inner, this) : inner()
            }
        }),
        (0,
        _dom.insertCSS)("\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    78: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.toolGroup = exports.questionInsertMenu = exports.questionCommandGroup = exports.contentInsertMenu = exports.contentCommandGroup = exports.Selection = exports.CheckList = exports.CheckItem = exports.Scale = exports.ScaleDisplay = exports.MultipleChoice = exports.Choice = exports.Essay = exports.ShortAnswer = exports.TextBox = exports.Question = exports.StrikeThroughMark = exports.UnderlineMark = exports.RightAlign = exports.CenterAlign = exports.LeftAlign = exports.alignGroup = exports.TextArea = exports.TextField = exports.Select = exports.RadioButton = exports.CheckBox = exports.Input = exports.Graph = exports.Website = exports.SpreadSheet = exports.InlineMath = exports.Image = exports.CarryForward = exports.BlockMath = void 0;
        var _content = require("./content");
        Object.defineProperty(exports, "BlockMath", {
            enumerable: !0,
            get: function() {
                return _content.BlockMath
            }
        }),
        Object.defineProperty(exports, "CarryForward", {
            enumerable: !0,
            get: function() {
                return _content.CarryForward
            }
        }),
        Object.defineProperty(exports, "Image", {
            enumerable: !0,
            get: function() {
                return _content.Image
            }
        }),
        Object.defineProperty(exports, "InlineMath", {
            enumerable: !0,
            get: function() {
                return _content.InlineMath
            }
        }),
        Object.defineProperty(exports, "SpreadSheet", {
            enumerable: !0,
            get: function() {
                return _content.SpreadSheet
            }
        }),
        Object.defineProperty(exports, "Website", {
            enumerable: !0,
            get: function() {
                return _content.Website
            }
        }),
        Object.defineProperty(exports, "Graph", {
            enumerable: !0,
            get: function() {
                return _content.Graph
            }
        });
        var _input = require("./input");
        Object.defineProperty(exports, "Input", {
            enumerable: !0,
            get: function() {
                return _input.Input
            }
        }),
        Object.defineProperty(exports, "CheckBox", {
            enumerable: !0,
            get: function() {
                return _input.CheckBox
            }
        }),
        Object.defineProperty(exports, "RadioButton", {
            enumerable: !0,
            get: function() {
                return _input.RadioButton
            }
        }),
        Object.defineProperty(exports, "Select", {
            enumerable: !0,
            get: function() {
                return _input.Select
            }
        }),
        Object.defineProperty(exports, "TextField", {
            enumerable: !0,
            get: function() {
                return _input.TextField
            }
        }),
        Object.defineProperty(exports, "TextArea", {
            enumerable: !0,
            get: function() {
                return _input.TextArea
            }
        });
        var _format = require("./format");
        Object.defineProperty(exports, "alignGroup", {
            enumerable: !0,
            get: function() {
                return _format.alignGroup
            }
        }),
        Object.defineProperty(exports, "LeftAlign", {
            enumerable: !0,
            get: function() {
                return _format.LeftAlign
            }
        }),
        Object.defineProperty(exports, "CenterAlign", {
            enumerable: !0,
            get: function() {
                return _format.CenterAlign
            }
        }),
        Object.defineProperty(exports, "RightAlign", {
            enumerable: !0,
            get: function() {
                return _format.RightAlign
            }
        }),
        Object.defineProperty(exports, "UnderlineMark", {
            enumerable: !0,
            get: function() {
                return _format.UnderlineMark
            }
        }),
        Object.defineProperty(exports, "StrikeThroughMark", {
            enumerable: !0,
            get: function() {
                return _format.StrikeThroughMark
            }
        });
        var _questions = require("./questions");
        Object.defineProperty(exports, "Question", {
            enumerable: !0,
            get: function() {
                return _questions.Question
            }
        }),
        Object.defineProperty(exports, "TextBox", {
            enumerable: !0,
            get: function() {
                return _questions.TextBox
            }
        }),
        Object.defineProperty(exports, "ShortAnswer", {
            enumerable: !0,
            get: function() {
                return _questions.ShortAnswer
            }
        }),
        Object.defineProperty(exports, "Essay", {
            enumerable: !0,
            get: function() {
                return _questions.Essay
            }
        }),
        Object.defineProperty(exports, "Choice", {
            enumerable: !0,
            get: function() {
                return _questions.Choice
            }
        }),
        Object.defineProperty(exports, "MultipleChoice", {
            enumerable: !0,
            get: function() {
                return _questions.MultipleChoice
            }
        }),
        Object.defineProperty(exports, "ScaleDisplay", {
            enumerable: !0,
            get: function() {
                return _questions.ScaleDisplay
            }
        }),
        Object.defineProperty(exports, "Scale", {
            enumerable: !0,
            get: function() {
                return _questions.Scale
            }
        }),
        Object.defineProperty(exports, "CheckItem", {
            enumerable: !0,
            get: function() {
                return _questions.CheckItem
            }
        }),
        Object.defineProperty(exports, "CheckList", {
            enumerable: !0,
            get: function() {
                return _questions.CheckList
            }
        }),
        Object.defineProperty(exports, "Selection", {
            enumerable: !0,
            get: function() {
                return _questions.Selection
            }
        });
        var _dom = require("prosemirror/dist/dom")
          , _menu = require("prosemirror/dist/menu/menu");
        require("./tool");
        var contentCommandGroup = exports.contentCommandGroup = new _menu.MenuCommandGroup("content")
          , questionCommandGroup = (exports.contentInsertMenu = new _menu.Dropdown({
            label: "Content..",
            displayActive: !0,
            "class": "ProseMirror-widgetinsert-dropdown"
        },[contentCommandGroup]),
        exports.questionCommandGroup = new _menu.MenuCommandGroup("question"));
        exports.questionInsertMenu = new _menu.Dropdown({
            label: "Question..",
            displayActive: !0,
            "class": "ProseMirror-widgetinsert-dropdown"
        },[questionCommandGroup]),
        exports.toolGroup = new _menu.MenuCommandGroup("tool");
        (0,
        _dom.insertCSS)("\n\n.ProseMirror .widgets-edit:hover {\n	background-image: url('icons/settings.png');\n	background-repeat: no-repeat;\n	background-position: top right;\n	cursor: pointer;\n }\n\n.ProseMirror-menu-dropdown-item {\n	white-space: nowrap;\n}\n \n.ProseMirror-menu-dropdown-menu {\n	border-radius: 6px;\n}\n\n.ProseMirror-menu-submenu {\n	border-radius: 6px;\n}\n\n\n")
    }
    , {
        "./content": 71,
        "./format": 76,
        "./input": 80,
        "./questions": 88,
        "./tool": 97,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/menu/menu": 28
    }],
    79: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.CheckBox = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _input = require("./input")
          , _utils = require("../../utils")
          , css = "widgets-checkbox"
          , CheckBox = exports.CheckBox = function(_Input) {
            function CheckBox() {
                return _classCallCheck(this, CheckBox),
                _possibleConstructorReturn(this, Object.getPrototypeOf(CheckBox).apply(this, arguments))
            }
            return _inherits(CheckBox, _Input),
            _createClass(CheckBox, [{
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        type: new _model.Attribute({
                            "default": "checkbox"
                        }),
                        value: new _model.Attribute({
                            "default": "1"
                        }),
                        "class": new _model.Attribute({
                            "default": css
                        })
                    }
                }
            }]),
            CheckBox
        }(_input.Input);
        (0,
        _utils.defParser)(CheckBox, "input", css),
        CheckBox.register("command", "insert", {
            label: "CheckBox",
            run: function(pm, name) {
                return pm.tr.replaceSelection(this.create({
                    name: name
                })).apply(pm.apply.scroll)
            },
            params: [{
                name: "Name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(CheckBox, "checkbox:insert", ["all"]),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + ":hover {\n	cursor: pointer;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./input": 81,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    80: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var _input = require("./input");
        Object.defineProperty(exports, "Input", {
            enumerable: !0,
            get: function() {
                return _input.Input
            }
        });
        var _checkbox = require("./checkbox");
        Object.defineProperty(exports, "CheckBox", {
            enumerable: !0,
            get: function() {
                return _checkbox.CheckBox
            }
        });
        var _radiobutton = require("./radiobutton");
        Object.defineProperty(exports, "RadioButton", {
            enumerable: !0,
            get: function() {
                return _radiobutton.RadioButton
            }
        });
        var _select = require("./select");
        Object.defineProperty(exports, "Select", {
            enumerable: !0,
            get: function() {
                return _select.Select
            }
        });
        var _textfield = require("./textfield");
        Object.defineProperty(exports, "TextField", {
            enumerable: !0,
            get: function() {
                return _textfield.TextField
            }
        });
        var _textarea = require("./textarea");
        Object.defineProperty(exports, "TextArea", {
            enumerable: !0,
            get: function() {
                return _textarea.TextArea
            }
        })
    }
    , {
        "./checkbox": 79,
        "./input": 81,
        "./radiobutton": 82,
        "./select": 83,
        "./textarea": 84,
        "./textfield": 85
    }],
    81: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Input = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , css = "widgets-input"
          , Input = exports.Input = function(_Block) {
            function Input() {
                return _classCallCheck(this, Input),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Input).apply(this, arguments))
            }
            return _inherits(Input, _Block),
            _createClass(Input, [{
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        type: new _model.Attribute({
                            "default": "text"
                        }),
                        value: new _model.Attribute
                    }
                }
            }, {
                key: "selectable",
                get: function() {
                    return !1
                }
            }, {
                key: "contains",
                get: function() {
                    return null
                }
            }]),
            Input
        }(_model.Block);
        (0,
        _utils.defParser)(Input, css),
        Input.prototype.serializeDOM = function(node) {
            return (0,
            _dom.elt)("input", node.attrs)
        }
        ,
        (0,
        _dom.insertCSS)("\n		\n." + css + " {}\n\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    82: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.RadioButton = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , _input = require("./input")
          , css = "widgets-radiobutton"
          , RadioButton = exports.RadioButton = function(_Input) {
            function RadioButton() {
                return _classCallCheck(this, RadioButton),
                _possibleConstructorReturn(this, Object.getPrototypeOf(RadioButton).apply(this, arguments))
            }
            return _inherits(RadioButton, _Input),
            _createClass(RadioButton, [{
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        type: new _model.Attribute({
                            "default": "radio"
                        }),
                        value: new _model.Attribute,
                        "class": new _model.Attribute({
                            "default": css
                        })
                    }
                }
            }]),
            RadioButton
        }(_input.Input);
        (0,
        _utils.defParser)(RadioButton, "input", css),
        (0,
        _dom.insertCSS)("\n\n." + css + " {}\n\n")
    }
    , {
        "../../utils": 65,
        "./input": 81,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    83: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Select = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , css = "widgets-select"
          , Select = exports.Select = function(_Block) {
            function Select() {
                return _classCallCheck(this, Select),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Select).apply(this, arguments))
            }
            return _inherits(Select, _Block),
            _createClass(Select, [{
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        options: new _model.Attribute,
                        size: new _model.Attribute({
                            "default": 1
                        }),
                        multiple: new _model.Attribute({
                            "default": "single"
                        })
                    }
                }
            }, {
                key: "canBeEmpty",
                get: function() {
                    return !0
                }
            }, {
                key: "contains",
                get: function() {
                    return _model.NodeKind.text
                }
            }]),
            Select
        }(_model.Block);
        (0,
        _utils.defParser)(Select, "select", css),
        Select.prototype.serializeDOM = function(node) {
            var select = ("multiple" == node.attrs.multiple,
            (0,
            _dom.elt)("select", node.attrs));
            return node.attrs.options.split(",").map(function(option) {
                select.appendChild((0,
                _dom.elt)("option", {
                    value: option.trim()
                }, option))
            }),
            select
        }
        ,
        Select.register("command", "delete", {
            run: function(pm) {
                var _pm$selection = pm.selection
                  , node = (_pm$selection.from,
                _pm$selection.node);
                return node && node.type == this ? !0 : !1
            },
            keys: ["Backspace(10)", "Mod-Backspace(10)"]
        }),
        Select.register("command", "insert", {
            label: "Select",
            run: function(pm, name, options, size, multiple) {
                return pm.tr.replaceSelection(this.create({
                    name: name,
                    options: options,
                    size: size,
                    multiple: multiple
                })).apply(pm.apply.scroll)
            },
            params: [{
                name: "Name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Options",
                label: "comma separated names",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "options")
                }
            }, {
                name: "Size",
                label: "options displayed",
                type: "number",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "options")
                },
                options: {
                    min: 1,
                    max: 10,
                    "default": 1
                }
            }, {
                name: "Selection",
                label: "Selection (single or multiple)",
                type: "select",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "multiple")
                },
                options: [{
                    value: "multiple",
                    label: "multiple"
                }, {
                    value: "single",
                    label: "single"
                }]
            }]
        }),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + " {}\n\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    84: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.TextArea = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = (require("./input"),
        require("../../utils"))
          , css = "widgets-textarea"
          , TextArea = exports.TextArea = function(_Block) {
            function TextArea() {
                return _classCallCheck(this, TextArea),
                _possibleConstructorReturn(this, Object.getPrototypeOf(TextArea).apply(this, arguments))
            }
            return _inherits(TextArea, _Block),
            _createClass(TextArea, [{
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        rows: new _model.Attribute,
                        cols: new _model.Attribute,
                        "class": new _model.Attribute({
                            "default": css
                        })
                    }
                }
            }, {
                key: "canBeEmpty",
                get: function() {
                    return !0
                }
            }, {
                key: "contains",
                get: function() {
                    return _model.NodeKind.text
                }
            }]),
            TextArea
        }(_model.Block);
        (0,
        _utils.defParser)(TextArea, "textarea", css),
        TextArea.prototype.serializeDOM = function(node, s) {
            return (0,
            _dom.elt)("textarea", node.attrs)
        }
        ,
        TextArea.register("command", "delete", {
            run: function(pm) {
                var _pm$selection = pm.selection
                  , node = (_pm$selection.from,
                _pm$selection.node);
                return node && node.type == this ? !0 : !1
            },
            keys: ["Backspace(10)", "Mod-Backspace(10)"]
        }),
        TextArea.register("command", "insert", {
            label: "TextArea",
            run: function(pm, name, rows, cols) {
                return pm.tr.replaceSelection(this.create({
                    name: name,
                    rows: rows,
                    cols: cols
                })).apply(pm.apply.scroll)
            },
            params: [{
                name: "Name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Rows",
                label: "In lines",
                type: "number",
                "default": "4",
                options: {
                    min: 2,
                    max: 24
                },
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "rows")
                }
            }, {
                name: "Columns",
                label: "In characters",
                type: "number",
                "default": "40",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "cols")
                },
                options: {
                    min: 2,
                    max: 80
                }
            }]
        }),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + ":hover {\n	cursor: pointer;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./input": 81,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    85: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.TextField = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _input = require("./input")
          , _utils = require("../../utils")
          , css = "widgets-textfield"
          , TextField = exports.TextField = function(_Input) {
            function TextField() {
                return _classCallCheck(this, TextField),
                _possibleConstructorReturn(this, Object.getPrototypeOf(TextField).apply(this, arguments))
            }
            return _inherits(TextField, _Input),
            _createClass(TextField, [{
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        type: new _model.Attribute({
                            "default": "text"
                        }),
                        size: new _model.Attribute({
                            "default": "20"
                        }),
                        "class": new _model.Attribute({
                            "default": css
                        })
                    }
                }
            }, {
                key: "canBeEmpty",
                get: function() {
                    return !0
                }
            }, {
                key: "contains",
                get: function() {
                    return _model.NodeKind.text
                }
            }]),
            TextField
        }(_input.Input);
        (0,
        _utils.defParser)(TextField, "input", css),
        TextField.register("command", "insert", {
            label: "TextField",
            run: function(pm, name) {
                return pm.tr.replaceSelection(this.create({
                    name: name
                })).apply(pm.apply.scroll)
            },
            params: [{
                name: "Name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Size",
                label: "Size in characters",
                type: "number",
                "default": "20",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "size")
                },
                options: {
                    min: 1,
                    max: 80
                }
            }]
        }),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + ":hover {\n	cursor: pointer;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./input": 81,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    86: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function renumber(pm, cl, parentpos) {
            var i = 1;
            cl.forEach(function(node, start) {
                node.type instanceof CheckItem && pm.tr.setNodeType(parentpos + start, node.type, {
                    name: cl.attrs.name + "-" + i,
                    value: i++
                }).apply()
            })
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }()
          , _get = function get(object, property, receiver) {
            null === object && (object = Function.prototype);
            var desc = Object.getOwnPropertyDescriptor(object, property);
            if (void 0 === desc) {
                var parent = Object.getPrototypeOf(object);
                return null === parent ? void 0 : get(parent, property, receiver)
            }
            if ("value"in desc)
                return desc.value;
            var getter = desc.get;
            if (void 0 !== getter)
                return getter.call(receiver)
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.CheckList = exports.CheckItem = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = (require("./textbox"),
        require("../../utils"))
          , _question = require("./question")
          , cssi = "widgets-checkitem"
          , cssc = "widgets-checklist";
        _model.NodeKind.checkitem = new _model.NodeKind("checkitem");
        var CheckItem = exports.CheckItem = function(_Block) {
            function CheckItem() {
                return _classCallCheck(this, CheckItem),
                _possibleConstructorReturn(this, Object.getPrototypeOf(CheckItem).apply(this, arguments))
            }
            return _inherits(CheckItem, _Block),
            _createClass(CheckItem, [{
                key: "create",
                value: function(attrs, content, marks) {
                    if (content.content) {
                        var len = content.content.length;
                        content = _model.Fragment.from([this.schema.nodes.checkbox.create(attrs), content.content[len - 1]])
                    }
                    return _get(Object.getPrototypeOf(CheckItem.prototype), "create", this).call(this, attrs, content, marks)
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute({
                            "default": ""
                        }),
                        value: new _model.Attribute({
                            "default": 1
                        }),
                        "class": new _model.Attribute({
                            "default": cssi
                        })
                    }
                }
            }], [{
                key: "kind",
                get: function() {
                    return _model.NodeKind.checkitem
                }
            }]),
            CheckItem
        }(_model.Block)
          , CheckList = exports.CheckList = function(_Question) {
            function CheckList() {
                return _classCallCheck(this, CheckList),
                _possibleConstructorReturn(this, Object.getPrototypeOf(CheckList).apply(this, arguments))
            }
            return _inherits(CheckList, _Question),
            _createClass(CheckList, [{
                key: "defaultContent",
                value: function(attrs) {
                    var choice_content = _model.Fragment.from([this.schema.nodes.checkbox.create(attrs), this.schema.nodes.textbox.create()]);
                    return _model.Fragment.from([this.schema.nodes.paragraph.create(null, ""), this.schema.nodes.checkitem.create(attrs, choice_content)])
                }
            }, {
                key: "create",
                value: function(attrs, content, marks) {
                    return content || (content = this.defaultContent(attrs)),
                    _get(Object.getPrototypeOf(CheckList.prototype), "create", this).call(this, attrs, content, marks)
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute({
                            "default": ""
                        }),
                        title: new _model.Attribute({
                            "default": ""
                        }),
                        "class": new _model.Attribute({
                            "default": cssc + " " + _question.qclass
                        })
                    }
                }
            }, {
                key: "isList",
                get: function() {
                    return !0
                }
            }]),
            CheckList
        }(_question.Question);
        (0,
        _utils.defParser)(CheckItem, "div", cssi),
        (0,
        _utils.defParser)(CheckList, "div", cssc),
        CheckItem.prototype.serializeDOM = function(node, s) {
            return s.renderAs(node, "div", node.attrs)
        }
        ,
        CheckItem.register("command", "split", {
            label: "Split the current checkitem",
            run: function(pm) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , to = _pm$selection.to
                  , node = _pm$selection.node
                  , $from = pm.doc.resolve(from)
                  , $to = pm.doc.resolve(to);
                if (node && node.isBlock || from.depth < 2 || !$from.sameParent($to))
                    return !1;
                var ci = $from.node($from.depth - 1);
                if (ci.type != this)
                    return !1;
                var tr = pm.tr.split(from, 2).apply(pm.apply.scroll);
                return tr = pm.tr.insert(from + 3, this.schema.nodes.checkbox.create(ci.attrs)).apply(pm.apply.scroll),
                $from = pm.doc.resolve(from),
                renumber(pm, $from.node($from.depth - 2), $from.start($from.depth - 2)),
                tr
            },
            keys: ["Enter(20)"]
        }),
        CheckItem.register("command", "delete", {
            label: "delete this checkitem or checklist",
            run: function(pm) {
                var _pm$selection2 = pm.selection
                  , from = _pm$selection2.from
                  , to = _pm$selection2.to
                  , node = (_pm$selection2.head,
                _pm$selection2.node)
                  , $from = pm.doc.resolve(from);
                if (node && node.type instanceof CheckList)
                    return pm.tr["delete"](from, to).apply(pm.apply.scroll);
                if (node)
                    return !1;
                var ci = $from.node($from.depth - 1);
                if (!(ci.type instanceof CheckItem))
                    return !1;
                if ($from.parentOffset > 0)
                    return pm.tr["delete"](from, to).apply(pm.apply.scroll);
                var cl = $from.node($from.depth - 2);
                if (2 == cl.childCount || ci.lastChild.content.size > 0)
                    return !0;
                var before = $from.before($from.depth - 1)
                  , after = $from.after($from.depth - 1)
                  , tr = pm.tr["delete"](before, after).apply(pm.apply.scroll);
                if ($from = pm.doc.resolve(from),
                $from.nodeAfter) {
                    var $pos = pm.doc.resolve(after);
                    renumber(pm, $from.node($from.depth - 2), $from.start($from.depth - 2)),
                    pm.setTextSelection($pos.end($pos.depth) - 1)
                } else {
                    var $pos = pm.doc.resolve(before);
                    pm.setTextSelection($pos.after($pos.depth) + 1)
                }
                return tr
            },
            keys: ["Backspace(9)", "Mod-Backspace(9)"]
        }),
        CheckList.register("command", "insert", {
            label: "Check List",
            run: function(pm, name, title) {
                var _pm$selection3 = pm.selection
                  , from = _pm$selection3.from
                  , node = _pm$selection3.node
                  , $from = pm.doc.resolve(from)
                  , attrs = {
                    name: name,
                    title: title,
                    value: 1
                };
                if (node && node.type == this) {
                    var tr = pm.tr.setNodeType(from, this, attrs).apply();
                    return $from = pm.doc.resolve(from),
                    renumber(pm, $from.nodeAfter, from + 1),
                    tr
                }
                return (0,
                _question.insertQuestion)(pm, from, this.create(attrs))
            },
            select: function(pm) {
                return !0
            },
            menu: {
                group: "question",
                rank: 70,
                display: {
                    type: "label",
                    label: "CheckList"
                }
            },
            params: [{
                name: "Name",
                attr: "name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Title",
                attr: "title",
                label: "(optional)",
                type: "text",
                "default": "",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "title")
                },
                options: {
                    required: ""
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(CheckList, "checklist:insert"),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + cssi + " {\n	cursor: text;\n}\n\n.ProseMirror ." + cssi + " input {\n	float: left;\n}\n\n\n")
    }
    , {
        "../../utils": 65,
        "./question": 90,
        "./textbox": 94,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    87: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }()
          , _get = function get(object, property, receiver) {
            null === object && (object = Function.prototype);
            var desc = Object.getOwnPropertyDescriptor(object, property);
            if (void 0 === desc) {
                var parent = Object.getPrototypeOf(object);
                return null === parent ? void 0 : get(parent, property, receiver)
            }
            if ("value"in desc)
                return desc.value;
            var getter = desc.get;
            if (void 0 !== getter)
                return getter.call(receiver)
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Essay = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , _question = require("./question")
          , css = (require("../../widgets"),
        "widgets-essay")
          , Essay = exports.Essay = function(_Question) {
            function Essay() {
                return _classCallCheck(this, Essay),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Essay).apply(this, arguments))
            }
            return _inherits(Essay, _Question),
            _createClass(Essay, [{
                key: "defaultContent",
                value: function(attrs) {
                    return _model.Fragment.from([this.schema.nodes.paragraph.create(null, ""), this.schema.nodes.textarea.create(attrs)])
                }
            }, {
                key: "create",
                value: function(attrs, content, marks) {
                    return content || (content = this.defaultContent(attrs)),
                    _get(Object.getPrototypeOf(Essay.prototype), "create", this).call(this, attrs, content, marks)
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute({
                            "default": ""
                        }),
                        title: new _model.Attribute({
                            "default": ""
                        }),
                        rows: new _model.Attribute({
                            "default": 4
                        }),
                        cols: new _model.Attribute({
                            "default": 60
                        }),
                        "class": new _model.Attribute({
                            "default": css + " " + _question.qclass
                        })
                    }
                }
            }]),
            Essay
        }(_question.Question);
        (0,
        _utils.defParser)(Essay, "div", css),
        Essay.register("command", "insert", {
            label: "Essay",
            run: function(pm, name, title, rows, cols) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , node = _pm$selection.node
                  , $from = pm.doc.resolve(from)
                  , attrs = {
                    name: name,
                    title: title,
                    rows: rows,
                    cols: cols
                };
                if (node && node.type instanceof Essay) {
                    pm.tr.setNodeType(from, this, attrs).apply(pm.apply.scroll);
                    return $from = pm.doc.resolve(from),
                    (0,
                    _question.setChildAttrs)(pm, $from.nodeAfter, from + 1, "textarea", attrs)
                }
                return (0,
                _question.insertQuestion)(pm, from, this.create(attrs))
            },
            select: function(pm) {
                return from.parent.type.canContainType(this)
            },
            menu: {
                group: "question",
                rank: 72,
                display: {
                    type: "label",
                    label: "Essay"
                },
                select: "ignore"
            },
            params: [{
                name: "Name",
                attr: "name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Title",
                attr: "title",
                label: "(optional)",
                type: "text",
                "default": "",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "title")
                },
                options: {
                    required: ""
                }
            }, {
                name: "Rows",
                attr: "rows",
                label: "In lines lines",
                type: "number",
                "default": 4,
                options: {
                    min: 2,
                    max: 24
                },
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "rows")
                }
            }, {
                name: "Columns",
                attr: "cols",
                label: "In characters",
                type: "number",
                "default": 60,
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "cols")
                },
                options: {
                    min: 2,
                    max: 80
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(Essay, "essay:insert"),
        (0,
        _dom.insertCSS)("\n\n.ProseMirror ." + css + " textarea {\n	resize: none;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "../../widgets": 78,
        "./question": 90,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    88: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var _textbox = require("./textbox");
        Object.defineProperty(exports, "TextBox", {
            enumerable: !0,
            get: function() {
                return _textbox.TextBox
            }
        });
        var _shortanswer = require("./shortanswer");
        Object.defineProperty(exports, "ShortAnswer", {
            enumerable: !0,
            get: function() {
                return _shortanswer.ShortAnswer
            }
        });
        var _essay = require("./essay");
        Object.defineProperty(exports, "Essay", {
            enumerable: !0,
            get: function() {
                return _essay.Essay
            }
        });
        var _multiplechoice = require("./multiplechoice");
        Object.defineProperty(exports, "MultipleChoice", {
            enumerable: !0,
            get: function() {
                return _multiplechoice.MultipleChoice
            }
        }),
        Object.defineProperty(exports, "Choice", {
            enumerable: !0,
            get: function() {
                return _multiplechoice.Choice
            }
        });
        var _checklist = require("./checklist");
        Object.defineProperty(exports, "CheckList", {
            enumerable: !0,
            get: function() {
                return _checklist.CheckList
            }
        }),
        Object.defineProperty(exports, "CheckItem", {
            enumerable: !0,
            get: function() {
                return _checklist.CheckItem
            }
        });
        var _scale = require("./scale");
        Object.defineProperty(exports, "Scale", {
            enumerable: !0,
            get: function() {
                return _scale.Scale
            }
        }),
        Object.defineProperty(exports, "ScaleDisplay", {
            enumerable: !0,
            get: function() {
                return _scale.ScaleDisplay
            }
        });
        var _selection = require("./selection");
        Object.defineProperty(exports, "Selection", {
            enumerable: !0,
            get: function() {
                return _selection.Selection
            }
        });
        var _question = require("./question");
        Object.defineProperty(exports, "Question", {
            enumerable: !0,
            get: function() {
                return _question.Question
            }
        })
    }
    , {
        "./checklist": 86,
        "./essay": 87,
        "./multiplechoice": 89,
        "./question": 90,
        "./scale": 91,
        "./selection": 92,
        "./shortanswer": 93,
        "./textbox": 94
    }],
    89: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function renumber(pm, mc, parentpos) {
            var i = 1;
            mc.forEach(function(node, start) {
                node.type instanceof Choice && pm.tr.setNodeType(parentpos + start, node.type, {
                    name: mc.attrs.name + "-" + i,
                    value: i++
                }).apply()
            })
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }()
          , _get = function get(object, property, receiver) {
            null === object && (object = Function.prototype);
            var desc = Object.getOwnPropertyDescriptor(object, property);
            if (void 0 === desc) {
                var parent = Object.getPrototypeOf(object);
                return null === parent ? void 0 : get(parent, property, receiver)
            }
            if ("value"in desc)
                return desc.value;
            var getter = desc.get;
            if (void 0 !== getter)
                return getter.call(receiver)
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.MultipleChoice = exports.Choice = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , _question = require("./question")
          , cssc = "widgets-choice"
          , cssm = "widgets-multiplechoice"
          , Choice = exports.Choice = function(_Block) {
            function Choice() {
                return _classCallCheck(this, Choice),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Choice).apply(this, arguments))
            }
            return _inherits(Choice, _Block),
            _createClass(Choice, [{
                key: "create",
                value: function(attrs, content, marks) {
                    if (content.content) {
                        var len = content.content.length;
                        content = _model.Fragment.from([this.schema.nodes.radiobutton.create(attrs), content.content[len - 1]])
                    }
                    return _get(Object.getPrototypeOf(Choice.prototype), "create", this).call(this, attrs, content, marks)
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute({
                            "default": ""
                        }),
                        value: new _model.Attribute({
                            "default": 1
                        }),
                        "class": new _model.Attribute({
                            "default": cssc
                        })
                    }
                }
            }]),
            Choice
        }(_model.Block)
          , MultipleChoice = exports.MultipleChoice = function(_Question) {
            function MultipleChoice() {
                return _classCallCheck(this, MultipleChoice),
                _possibleConstructorReturn(this, Object.getPrototypeOf(MultipleChoice).apply(this, arguments))
            }
            return _inherits(MultipleChoice, _Question),
            _createClass(MultipleChoice, [{
                key: "defaultContent",
                value: function(attrs) {
                    var choice_content = _model.Fragment.from([this.schema.nodes.radiobutton.create(attrs), this.schema.nodes.textbox.create()]);
                    return _model.Fragment.from([this.schema.nodes.paragraph.create(null, ""), this.schema.nodes.choice.create(attrs, choice_content)])
                }
            }, {
                key: "create",
                value: function(attrs, content, marks) {
                    return content || (content = this.defaultContent(attrs)),
                    _get(Object.getPrototypeOf(MultipleChoice.prototype), "create", this).call(this, attrs, content, marks)
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        title: new _model.Attribute({
                            "default": ""
                        }),
                        "class": new _model.Attribute({
                            "default": cssm + " " + _question.qclass
                        })
                    }
                }
            }, {
                key: "isList",
                get: function() {
                    return !0
                }
            }]),
            MultipleChoice
        }(_question.Question);
        (0,
        _utils.defParser)(Choice, "div", cssc),
        (0,
        _utils.defParser)(MultipleChoice, "div", cssm),
        Choice.prototype.serializeDOM = function(node, s) {
            return s.renderAs(node, "div", node.attrs)
        }
        ,
        Choice.register("command", "split", {
            label: "Split the current choice",
            run: function(pm) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , to = _pm$selection.to
                  , node = _pm$selection.node
                  , $from = pm.doc.resolve(from)
                  , $to = pm.doc.resolve(to);
                if (node && node.isBlock || from.depth < 2 || !$from.sameParent($to))
                    return !1;
                var chc = $from.node($from.depth - 1);
                if (chc.type != this)
                    return !1;
                var tr = pm.tr.split(from, 2).apply(pm.apply.scroll);
                return tr = pm.tr.insert(from + 3, this.schema.nodes.radiobutton.create(chc.attrs)).apply(pm.apply.scroll),
                $from = pm.doc.resolve(from),
                renumber(pm, $from.node($from.depth - 2), $from.start($from.depth - 2)),
                tr
            },
            keys: ["Enter(20)"]
        }),
        Choice.register("command", "delete", {
            label: "delete this choice or multiplechoice",
            run: function(pm) {
                var _pm$selection2 = pm.selection
                  , from = _pm$selection2.from
                  , to = _pm$selection2.to
                  , node = (_pm$selection2.head,
                _pm$selection2.node)
                  , $from = pm.doc.resolve(from);
                if (node && node.type instanceof MultipleChoice)
                    return pm.tr["delete"](from, to).apply(pm.apply.scroll);
                if (node)
                    return !1;
                var chc = $from.node($from.depth - 1);
                if (!(chc.type instanceof Choice))
                    return !1;
                if ($from.parentOffset > 0)
                    return pm.tr["delete"](from, to).apply(pm.apply.scroll);
                var mc = $from.node($from.depth - 2);
                if (2 == mc.childCount || chc.lastChild.content.size > 0)
                    return !0;
                var before = $from.before($from.depth - 1)
                  , after = $from.after($from.depth - 1)
                  , tr = pm.tr["delete"](before, after).apply(pm.apply.scroll);
                if ($from = pm.doc.resolve(from),
                $from.nodeAfter) {
                    var $pos = pm.doc.resolve(after);
                    renumber(pm, $from.node($from.depth - 2), $from.start($from.depth - 2)),
                    pm.setTextSelection($pos.end($pos.depth) - 1)
                } else {
                    var $pos = pm.doc.resolve(before);
                    pm.setTextSelection($pos.after($pos.depth) + 1)
                }
                return tr
            },
            keys: ["Backspace(9)", "Mod-Backspace(9)"]
        }),
        MultipleChoice.register("command", "insert", {
            label: "MultipleChoice",
            run: function(pm, name, title) {
                var _pm$selection3 = pm.selection
                  , from = _pm$selection3.from
                  , node = _pm$selection3.node
                  , $from = pm.doc.resolve(from)
                  , attrs = {
                    name: name,
                    title: title,
                    value: 1
                };
                if (node && node.type == this) {
                    var tr = pm.tr.setNodeType(from, this, attrs).apply(pm.apply.scroll);
                    return $from = pm.doc.resolve(from),
                    renumber(pm, $from.nodeAfter, from + 1),
                    tr
                }
                return (0,
                _question.insertQuestion)(pm, from, this.create(attrs))
            },
            select: function(pm) {
                return !0
            },
            menu: {
                group: "question",
                rank: 70,
                display: {
                    type: "label",
                    label: "MultipleChoice"
                }
            },
            params: [{
                name: "Name",
                attr: "name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Title",
                attr: "title",
                label: "(optional)",
                type: "text",
                "default": "",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "title")
                },
                options: {
                    required: ""
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(MultipleChoice, "multiplechoice:insert"),
        (0,
        _dom.insertCSS)("\n\n." + cssc + " input {\n	float: left;\n}\n\n.ProseMirror ." + cssc + ":hover {\n	cursor: text;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./question": 90,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    90: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        function setChildAttrs(pm, parent, parentpos, type, attrs) {
            var pa = parent.attrs;
            for (var key in pa)
                if (pa[key] != attrs[key])
                    return;
            return parent.forEach(function(node, start) {
                return node.type.name == type ? pm.tr.setNodeType(parentpos + start, node.type, attrs).apply() : void 0
            }),
            !1
        }
        function insertQuestion(pm, pos, q) {
            var $pos = pm.doc.resolve(pos)
              , p = $pos.end(1);
            return pm.tr.insert(p, q).apply(pm.apply.scroll),
            q.firstChild && q.firstChild.isTextblock && pm.setTextSelection(p + 3),
            !0
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Question = exports.qclass = void 0,
        exports.setChildAttrs = setChildAttrs,
        exports.insertQuestion = insertQuestion;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _textbox = (require("../../utils"),
        require("prosemirror/dist/transform"),
        require("./textbox"))
          , css = "widgets-question"
          , Question = (exports.qclass = css + " widgets-edit",
        exports.Question = function(_Block) {
            function Question() {
                return _classCallCheck(this, Question),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Question).apply(this, arguments))
            }
            return _inherits(Question, _Block),
            _createClass(Question, [{
                key: "getDropPos",
                value: function(pm, from, to) {
                    if (!to)
                        return null;
                    var $to = pm.doc.resolve(to);
                    return $to.start(1)
                }
            }, {
                key: "draggable",
                get: function() {
                    return !0
                }
            }]),
            Question
        }(_model.Block));
        Question.prototype.serializeDOM = function(node, s) {
            return s.renderAs(node, "div", node.attrs)
        }
        ,
        Question.register("command", "delete", {
            label: "delete text from question",
            run: function(pm) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , $from = (_pm$selection.node,
                pm.doc.resolve(from));
                if ($from.parentOffset > 0 || 2 > from)
                    return !1;
                var $prev = pm.doc.resolve(from - 2);
                if ($prev.parent.type instanceof Question)
                    return pm.tr["delete"]($prev.before($prev.depth), $prev.after($prev.depth)).apply(pm.apply.scroll);
                if (!($from.parent.type instanceof _textbox.TextBox))
                    return !1;
                var parent = $from.node($from.depth - 2);
                return parent.type instanceof Question
            },
            keys: ["Backspace(10)", "Mod-Backspace(10)"]
        }),
        Question.register("command", "enter", {
            label: "process enter",
            run: function(pm) {
                var _pm$selection2 = pm.selection
                  , from = _pm$selection2.from
                  , node = _pm$selection2.node
                  , $from = pm.doc.resolve(from);
                if (node && node.type instanceof Question) {
                    var _parent = $from.parent;
                    if (_parent.lastChild == node || !_parent.child(from.offset + 1).isTextblock) {
                        var side = $from.end($from.depth);
                        pm.tr.insert(side, pm.schema.defaultTextblockType().create()).apply(pm.apply.scroll),
                        pm.setTextSelection(side + 3)
                    }
                    return !0
                }
                if ($from.parentOffset > 0 || $from.depth < 3 || !($from.parent.type instanceof _model.Textblock))
                    return !1;
                var parent = $from.node($from.depth - 2);
                return parent.type instanceof Question
            },
            keys: ["Enter(10)", "Mod-Enter(10)"]
        }),
        (0,
        _dom.insertCSS)("\n		\n." + css + " {\n	counter-increment: qcnt;\n	border: 1px solid #DDD;\n    border-radius: 4px;\n	padding: 8px;\n	margin-top: 1em;\n}\n\n." + css + ':before {\n	content: counter(qcnt)"." attr(title);\n	font-size: 80%;\n	font-weight: bold;\n	cursor: grabbing;\n}\n\n.ProseMirror .' + css + " p:hover {\n    cursor: text;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "./textbox": 94,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34,
        "prosemirror/dist/transform": 41
    }],
    91: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _get = function get(object, property, receiver) {
            null === object && (object = Function.prototype);
            var desc = Object.getOwnPropertyDescriptor(object, property);
            if (void 0 === desc) {
                var parent = Object.getPrototypeOf(object);
                return null === parent ? void 0 : get(parent, property, receiver)
            }
            if ("value"in desc)
                return desc.value;
            var getter = desc.get;
            if (void 0 !== getter)
                return getter.call(receiver)
        }
          , _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Scale = exports.ScaleDisplay = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , _question = require("./question")
          , cssd = "widgets-scaledisplay"
          , csss = "widgets-scale"
          , ScaleDisplay = exports.ScaleDisplay = function(_Block) {
            function ScaleDisplay() {
                return _classCallCheck(this, ScaleDisplay),
                _possibleConstructorReturn(this, Object.getPrototypeOf(ScaleDisplay).apply(this, arguments))
            }
            return _inherits(ScaleDisplay, _Block),
            _createClass(ScaleDisplay, [{
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute({
                            "default": ""
                        }),
                        startvalue: new _model.Attribute({
                            "default": "1"
                        }),
                        startlabel: new _model.Attribute({
                            "default": "low"
                        }),
                        endvalue: new _model.Attribute({
                            "default": "10"
                        }),
                        endlabel: new _model.Attribute({
                            "default": "high"
                        }),
                        "class": new _model.Attribute({
                            "default": cssd
                        })
                    }
                }
            }, {
                key: "canBeEmpty",
                get: function() {
                    return !0
                }
            }, {
                key: "contains",
                get: function() {
                    return _model.NodeKind.text
                }
            }]),
            ScaleDisplay
        }(_model.Block);
        ScaleDisplay.prototype.serializeDOM = function(node, s) {
            var startVal = Number(node.attrs.startvalue)
              , endVal = Number(node.attrs.endvalue)
              , mid = String(Math.round(Math.abs(endVal - startVal) / 2))
              , out = (0,
            _dom.elt)("input", {
                "for": node.attrs.name,
                readonly: "readonly"
            }, mid)
              , setOutputValue = void 0;
            endVal > startVal ? setOutputValue = function(val) {
                out.value = val
            }
            : !function() {
                var max = startVal;
                setOutputValue = function(val) {
                    out.value = max - val
                }
                ,
                endVal = startVal - endVal,
                startVal = 0
            }();
            var range = (0,
            _dom.elt)("input", {
                "class": "widgets-input",
                value: mid,
                name: node.attrs.name,
                id: node.attrs.name,
                type: "range",
                min: startVal,
                max: endVal,
                contenteditable: !1
            });
            return range.addEventListener("input", function(e) {
                e.stopPropagation(),
                setOutputValue(e.originalTarget.valueAsNumber)
            }),
            (0,
            _dom.elt)("div", node.attrs, (0,
            _dom.elt)("span", null, node.attrs.startlabel), range, (0,
            _dom.elt)("span", null, node.attrs.endlabel), out)
        }
        ;
        var Scale = exports.Scale = function(_Question) {
            function Scale() {
                return _classCallCheck(this, Scale),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Scale).apply(this, arguments))
            }
            return _inherits(Scale, _Question),
            _createClass(Scale, [{
                key: "defaultContent",
                value: function(attrs) {
                    return _model.Fragment.from([this.schema.nodes.paragraph.create(null, ""), this.schema.nodes.scaledisplay.create(attrs)])
                }
            }, {
                key: "create",
                value: function(attrs, content, marks) {
                    return content || (content = this.defaultContent(attrs)),
                    _get(Object.getPrototypeOf(Scale.prototype), "create", this).call(this, attrs, content, marks)
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        title: new _model.Attribute({
                            "default": ""
                        }),
                        startvalue: new _model.Attribute({
                            "default": "1"
                        }),
                        startlabel: new _model.Attribute({
                            "default": "low"
                        }),
                        endvalue: new _model.Attribute({
                            "default": "10"
                        }),
                        endlabel: new _model.Attribute({
                            "default": "high"
                        }),
                        "class": new _model.Attribute({
                            "default": "widgets-scale " + _question.qclass
                        })
                    }
                }
            }]),
            Scale
        }(_question.Question);
        (0,
        _utils.defParser)(Scale, "div", cssd),
        (0,
        _utils.defParser)(Scale, "div", csss),
        Scale.register("command", "insert", {
            label: "Scale",
            run: function(pm, name, title, startvalue, startlabel, endvalue, endlabel) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , node = (_pm$selection.to,
                _pm$selection.node)
                  , attrs = {
                    name: name,
                    title: title,
                    startvalue: startvalue,
                    startlabel: startlabel,
                    endvalue: endvalue,
                    endlabel: endlabel
                };
                if (node && node.type == this) {
                    pm.tr.setNodeType(from, this, attrs).apply(pm.apply.scroll);
                    var $from = pm.doc.resolve(from);
                    return (0,
                    _question.setChildAttrs)(pm, $from.nodeAfter, from + 1, "scaledisplay", attrs)
                }
                return (0,
                _question.insertQuestion)(pm, from, this.create(attrs))
            },
            menu: {
                group: "question",
                rank: 74,
                display: {
                    type: "label",
                    label: "Scale"
                }
            },
            params: [{
                name: "Name",
                attr: "name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Title",
                attr: "title",
                label: "(optional)",
                type: "text",
                "default": "",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "title")
                },
                options: {
                    required: ""
                }
            }, {
                label: "Start value",
                attr: "startvalue",
                type: "number",
                "default": 1,
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "startvalue")
                }
            }, {
                name: "Start Label",
                attr: "startlabel",
                label: "Text on left",
                type: "text",
                "default": "low",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "startlabel")
                }
            }, {
                label: "End value",
                attr: "endvalue",
                type: "number",
                "default": 10,
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "endvalue")
                }
            }, {
                name: "End Label",
                attr: "endlabel",
                label: "Text on right",
                type: "text",
                "default": "high",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "endlabel")
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(Scale, "scale:insert"),
        (0,
        _dom.insertCSS)("\n\n." + cssd + " {\n	display: inline-block;\n	text-align: center;\n	font-size: 80%;\n}\n\n." + csss + " input {\n	vertical-align: middle;\n	display: inline;\n}\n\n." + csss + " input[readonly] {\n	vertical-align: middle;\n	border-radius: 4px;\n	text-align: right;\n	width: 20px;\n	height: 20px;\n	border: 1px solid #AAA;\n	display: inline;\n	padding: 2px;\n	margin: 4px;\n	background: white;\n}\n\n." + csss + " span {\n	vertical-align: middle;\n	font-weight: normal;\n	display: inline;\n}\n\n." + csss + " div {\n	display: inline-block;\n	padding: 4px;\n}\n\n." + csss + " input[type=range] {\n    -webkit-appearance: none;\n    border: 1px solid white;\n    width: 200px;\n	cursor: pointer;\n}\n." + csss + " input[type=range]::-webkit-slider-runnable-track {\n    width: 200px;\n    height: 5px;\n    background: skyblue;\n    border: none;\n    border-radius: 3px;\n}\n." + csss + " input[type=range]::-webkit-slider-thumb {\n    -webkit-appearance: none;\n    border: none;\n    height: 16px;\n    width: 16px;\n    border-radius: 50%;\n    background: navy;\n    margin-top: -4px;\n}\n." + csss + " input[type=range]:focus {\n    outline: none;\n}\n." + csss + " input[type=range]:focus::-webkit-slider-runnable-track {\n    background: #ccc;\n}\n\n." + csss + " input[type=range]::-moz-range-track {\n    width: 200px;\n    height: 5px;\n    background: skyblue;\n    border: none;\n    border-radius: 3px;\n}\n." + csss + " input[type=range]::-moz-range-thumb {\n    border: none;\n    height: 16px;\n    width: 16px;\n    border-radius: 50%;\n    background: navy;\n}\n\n." + csss + " input[type=range]:-moz-focusring{\n    outline: 1px solid white;\n    outline-offset: -1px;\n}\n\n." + csss + " input[type=range]::-ms-track {\n    width: 200px;\n    height: 5px;\n    background: transparent;\n    border-color: transparent;\n    border-width: 6px 0;\n\n    /*remove default tick marks*/\n    color: transparent;\n}\n." + csss + " input[type=range]::-ms-fill-lower {\n    background: ;\n    border-radius: 10px;\n}\n." + csss + " input[type=range]::-ms-fill-upper {\n    background: #ddd;\n    border-radius: 10px;\n}\n." + csss + " input[type=range]::-ms-thumb {\n    border: none;\n    height: 16px;\n    width: 16px;\n    border-radius: 50%;\n    background: navy;\n}\n." + csss + " input[type=range]:focus::-ms-fill-lower {\n    background: #888;\n}\n." + csss + " input[type=range]:focus::-ms-fill-upper {\n    background: #ccc;\n}\n")
    }
    , {
        "../../utils": 65,
        "./question": 90,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    92: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }()
          , _get = function get(object, property, receiver) {
            null === object && (object = Function.prototype);
            var desc = Object.getOwnPropertyDescriptor(object, property);
            if (void 0 === desc) {
                var parent = Object.getPrototypeOf(object);
                return null === parent ? void 0 : get(parent, property, receiver)
            }
            if ("value"in desc)
                return desc.value;
            var getter = desc.get;
            if (void 0 !== getter)
                return getter.call(receiver)
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.Selection = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = (require("../input"),
        require("../../utils"))
          , _question = require("./question")
          , css = "widgets-selection"
          , Selection = exports.Selection = function(_Question) {
            function Selection() {
                return _classCallCheck(this, Selection),
                _possibleConstructorReturn(this, Object.getPrototypeOf(Selection).apply(this, arguments))
            }
            return _inherits(Selection, _Question),
            _createClass(Selection, [{
                key: "defaultContent",
                value: function(attrs) {
                    return _model.Fragment.from([this.schema.nodes.paragraph.create(null, ""), this.schema.nodes.select.create(attrs)])
                }
            }, {
                key: "create",
                value: function(attrs, content, marks) {
                    return content || (content = this.defaultContent(attrs)),
                    _get(Object.getPrototypeOf(Selection.prototype), "create", this).call(this, attrs, content, marks)
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute({
                            "default": ""
                        }),
                        title: new _model.Attribute({
                            "default": ""
                        }),
                        options: new _model.Attribute({
                            "default": ""
                        }),
                        size: new _model.Attribute({
                            "default": 1
                        }),
                        multiple: new _model.Attribute({
                            "default": "single"
                        }),
                        "class": new _model.Attribute({
                            "default": css + " " + _question.qclass
                        })
                    }
                }
            }]),
            Selection
        }(_question.Question);
        (0,
        _utils.defParser)(Selection, "div", css),
        Selection.register("command", "insert", {
            label: "Selection",
            run: function(pm, name, title, options, size, multiple) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , node = (_pm$selection.to,
                _pm$selection.node)
                  , attrs = {
                    name: name,
                    title: title,
                    options: options,
                    size: size,
                    multiple: multiple
                };
                return node && node.type == this ? (pm.tr.setNodeType(from, this, attrs).apply(pm.apply.scroll),
                $from = pm.doc.resolve(from),
                (0,
                _question.setChildAttrs)(pm, $from.nodeAfter, from + 1, "select", attrs)) : (0,
                _question.insertQuestion)(pm, from, this.create(attrs))
            },
            menu: {
                group: "question",
                rank: 75,
                display: {
                    type: "label",
                    label: "Selection"
                }
            },
            params: [{
                name: "Name",
                attr: "name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Title",
                attr: "title",
                label: "(optional)",
                type: "text",
                "default": "",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "title")
                },
                options: {
                    required: ""
                }
            }, {
                name: "Options",
                attr: "options",
                label: "comma separated names",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "options")
                }
            }, {
                name: "Displayed",
                attr: "size",
                label: "options displayed",
                type: "number",
                "default": 1,
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "size")
                },
                options: {
                    min: 1,
                    max: 10
                }
            }, {
                name: "Selection",
                attr: "multiple",
                label: "Selection (single or multiple)",
                type: "select",
                "default": "single",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "multiple")
                },
                options: [{
                    value: "multiple",
                    label: "multiple"
                }, {
                    value: "single",
                    label: "single"
                }]
            }]
        }),
        (0,
        _utils.defParamsClick)(Selection, "selection:insert"),
        (0,
        _dom.insertCSS)("\n\n")
    }
    , {
        "../../utils": 65,
        "../input": 80,
        "./question": 90,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    93: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }()
          , _get = function get(object, property, receiver) {
            null === object && (object = Function.prototype);
            var desc = Object.getOwnPropertyDescriptor(object, property);
            if (void 0 === desc) {
                var parent = Object.getPrototypeOf(object);
                return null === parent ? void 0 : get(parent, property, receiver)
            }
            if ("value"in desc)
                return desc.value;
            var getter = desc.get;
            if (void 0 !== getter)
                return getter.call(receiver)
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.ShortAnswer = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = (require("../input"),
        require("../../utils"))
          , _question = require("./question")
          , css = "widgets-shortanswer"
          , ShortAnswer = exports.ShortAnswer = function(_Question) {
            function ShortAnswer() {
                return _classCallCheck(this, ShortAnswer),
                _possibleConstructorReturn(this, Object.getPrototypeOf(ShortAnswer).apply(this, arguments))
            }
            return _inherits(ShortAnswer, _Question),
            _createClass(ShortAnswer, [{
                key: "defaultContent",
                value: function(attrs) {
                    return _model.Fragment.from([this.schema.nodes.paragraph.create(null, ""), this.schema.nodes.textfield.create(attrs)])
                }
            }, {
                key: "create",
                value: function(attrs, content, marks) {
                    return content || (content = this.defaultContent(attrs)),
                    _get(Object.getPrototypeOf(ShortAnswer.prototype), "create", this).call(this, attrs, content, marks)
                }
            }, {
                key: "attrs",
                get: function() {
                    return {
                        name: new _model.Attribute,
                        title: new _model.Attribute({
                            "default": ""
                        }),
                        size: new _model.Attribute({
                            "default": "20"
                        }),
                        "class": new _model.Attribute({
                            "default": css + " " + _question.qclass
                        })
                    }
                }
            }]),
            ShortAnswer
        }(_question.Question);
        (0,
        _utils.defParser)(ShortAnswer, "div", css),
        ShortAnswer.register("command", "insert", {
            label: "Short Answer",
            run: function(pm, name, title, size) {
                var _pm$selection = pm.selection
                  , from = _pm$selection.from
                  , node = (_pm$selection.to,
                _pm$selection.node)
                  , attrs = {
                    name: name,
                    title: title,
                    size: size
                };
                if (node && node.type == this) {
                    pm.tr.setNodeType(from, this, attrs).apply(pm.apply.scroll);
                    var $from = pm.doc.resolve(from);
                    return (0,
                    _question.setChildAttrs)(pm, $from.nodeAfter, from + 1, "textfield", attrs)
                }
                return (0,
                _question.insertQuestion)(pm, from, this.create(attrs))
            },
            menu: {
                group: "question",
                rank: 71,
                display: {
                    type: "label",
                    label: "Short Answer"
                }
            },
            params: [{
                name: "Name",
                attr: "name",
                label: "Short ID",
                type: "text",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "name")
                },
                options: {
                    pattern: _utils.namePattern,
                    size: 10,
                    title: _utils.nameTitle
                }
            }, {
                name: "Title",
                attr: "title",
                label: "(optional)",
                type: "text",
                "default": "",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "title")
                },
                options: {
                    required: ""
                }
            }, {
                name: "Size",
                attr: "size",
                label: "Size in characters",
                type: "number",
                "default": "20",
                prefill: function(pm) {
                    return (0,
                    _utils.selectedNodeAttr)(pm, this, "size")
                },
                options: {
                    min: 1,
                    max: 80
                }
            }]
        }),
        (0,
        _utils.defParamsClick)(ShortAnswer, "shortanswer:insert"),
        (0,
        _dom.insertCSS)("\n")
    }
    , {
        "../../utils": 65,
        "../input": 80,
        "./question": 90,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    94: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function _possibleConstructorReturn(self, call) {
            if (!self)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass)
                throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.TextBox = void 0;
        var _model = require("prosemirror/dist/model")
          , _dom = require("prosemirror/dist/dom")
          , _utils = require("../../utils")
          , css = "widgets-textbox"
          , TextBox = exports.TextBox = function(_Textblock) {
            function TextBox() {
                return _classCallCheck(this, TextBox),
                _possibleConstructorReturn(this, Object.getPrototypeOf(TextBox).apply(this, arguments))
            }
            return _inherits(TextBox, _Textblock),
            TextBox
        }(_model.Textblock);
        (0,
        _utils.defParser)(TextBox, "div", css),
        TextBox.prototype.serializeDOM = function(node, s) {
            return s.renderAs(node, "div", {
                "class": css
            })
        }
        ,
        (0,
        _dom.insertCSS)("\n\n." + css + " {\n	margin-left: 1.2em;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34
    }],
    95: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function showMenu(comment, top) {
            "commentMenu" == commentMenu.className ? (commentMenu.className += " show",
            commentMenu.style.top = top,
            editId = comment.id) : (commentMenu.className = "commentMenu",
            editId = null)
        }
        function getCommentMenu() {
            var edit = (0,
            _dom.elt)("li", null, (0,
            _dom.elt)("span", null, "Edit"))
              , reply = (0,
            _dom.elt)("li", null, (0,
            _dom.elt)("span", null, "Reply"))
              , remove = (0,
            _dom.elt)("li", null, (0,
            _dom.elt)("span", null, "Remove"));
            return edit.addEventListener("click", function(e) {
                e.stopPropagation(),
                showMenu()
            }),
            reply.addEventListener("click", function(e) {
                e.stopPropagation(),
                showMenu()
            }),
            remove.addEventListener("click", function(e) {
                e.stopPropagation(),
                commentStore.removeComment(editId),
                editId = null,
                showMenu()
            }),
            (0,
            _dom.elt)("div", {
                "class": "commentMenu"
            }, (0,
            _dom.elt)("ul", null, edit, reply, remove))
        }
        function setPlaceholderText(text) {
            var mode = commentsNode.querySelector("input[name=mode]:checked")
              , modevalue = mode ? mode.value : "comment";
            text.placeholder = placetext[modevalue]
        }
        function getAddComment() {
            var addComment = void 0
              , addButton = (0,
            _dom.elt)("span", {
                "class": "comment-button"
            }, "Add Comment")
              , cancelButton = (0,
            _dom.elt)("span", {
                "class": "comment-button"
            }, "Cancel")
              , textArea = (0,
            _dom.elt)("textarea", {
                id: "textcomment",
                placeholder: "Enter comment (N/A for delete)"
            });
            addButton.addEventListener("click", function(e) {
                var modevalue = "comment";
                if (suggestMode) {
                    var mode = commentsNode.querySelector("input[name=mode]:checked");
                    modevalue = mode ? mode.value : "comment"
                }
                return "" == textArea.value && "delete" != modevalue ? void (textArea.placeholder = "Text is required for " + modevalue) : (addComment.className = "addComment hide",
                void commentStore.createComment(textArea.value, modevalue))
            }),
            cancelButton.addEventListener("click", function(e) {
                addComment.className = "addComment hide"
            });
            var commentMode = (0,
            _dom.elt)("span", null, (0,
            _dom.elt)("input", {
                type: "radio",
                name: "mode",
                value: "comment",
                checked: "checked"
            }), "comment")
              , modes = ["insert", "replace", "delete"].map(function(s) {
                return (0,
                _dom.elt)("span", null, (0,
                _dom.elt)("input", {
                    type: "radio",
                    name: "mode",
                    value: s
                }), s)
            });
            if (suggestMode) {
                var modesPanel = (0,
                _dom.elt)("div", {
                    "class": "mode"
                }, commentMode, modes);
                return modesPanel.addEventListener("click", function(e) {
                    return setPlaceholderText(textArea)
                }),
                addComment = (0,
                _dom.elt)("div", {
                    "class": "addComment hide",
                    id: "addcomment"
                }, textArea, modesPanel, addButton, cancelButton)
            }
            return addComment = (0,
            _dom.elt)("div", {
                "class": "addComment hide",
                id: "addcomment"
            }, textArea, addButton, cancelButton)
        }
        function initComments(pm) {
            var suggest = arguments.length <= 1 || void 0 === arguments[1] ? !1 : arguments[1];
            commentStore = new CommentStore(pm,0),
            (0,
            _event.eventMixin)(CommentStore),
            suggestMode = suggest,
            commentsNode.innerHTML = "",
            (0,
            _utils.onResize)(pm.wrapper, function() {
                commentStore.reflow()
            }),
            commentMenu = getCommentMenu();
            var addComment = getAddComment()
              , commentHeader = (0,
            _dom.elt)("div", {
                "class": "comment-header"
            }, (0,
            _dom.elt)("span", null, "Comments"));
            commentsNode.addEventListener("click", function(e) {
                commentMenu.className = "commentMenu",
                editId = null
            }),
            commentsNode.appendChild(commentHeader),
            commentsNode.appendChild(commentMenu),
            commentsNode.appendChild(addComment)
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.CommentStore = exports.commentCmdSpec = void 0,
        exports.initComments = initComments;
        var _dom = require("prosemirror/dist/dom")
          , _event = (require("prosemirror/dist/model"),
        require("prosemirror/dist/util/event"))
          , _utils = require("../../utils")
          , commentsNode = document.querySelector("#comments")
          , commentStore = null
          , commentMenu = null
          , editId = null
          , suggestMode = void 0
          , Comment = (exports.commentCmdSpec = {
            label: "Comment",
            select: function(pm) {
                return !0
            },
            run: function(pm) {
                var addComment = document.querySelector("#addcomment")
                  , text = addComment.querySelector("#textcomment");
                return text.value = "",
                "addComment" == addComment.className ? !0 : (text.focus(),
                addComment.style.top = commentStore.getSelectionTop() + "px",
                addComment.className = "addComment",
                setPlaceholderText(text),
                !0)
            },
            menu: {
                group: "tool",
                rank: 73,
                select: "disable",
                display: {
                    type: "icon",
                    width: 1024,
                    height: 1024,
                    path: "M512 219q-116 0-218 39t-161 107-59 145q0 64 40 122t115 100l49 28-15 54q-13 52-40 98 86-36 157-97l24-21 32 3q39 4 74 4 116 0 218-39t161-107 59-145-59-145-161-107-218-39zM1024 512q0 99-68 183t-186 133-257 48q-40 0-82-4-113 100-262 138-28 8-65 12h-2q-8 0-15-6t-9-15v-0q-1-2-0-6t1-5 2-5l3-5t4-4 4-5q4-4 17-19t19-21 17-22 18-29 15-33 14-43q-89-50-141-125t-51-160q0-99 68-183t186-133 257-48 257 48 186 133 68 183z"
                }
            }
        },
        function() {
            function Comment(id, text, range, mode) {
                _classCallCheck(this, Comment),
                this.id = id,
                this.text = text,
                this.range = range,
                this.mode = mode,
                this.dom = null
            }
            return _createClass(Comment, [{
                key: "getRangeClass",
                value: function(select) {
                    return "mode-" + this.mode + (select ? "-select" : "")
                }
            }, {
                key: "height",
                get: function() {
                    var r = this.dom.getBoundingClientRect();
                    return r.bottom - r.top
                }
            }, {
                key: "newDom",
                get: function() {
                    var _this = this;
                    if (suggestMode) {
                        var modeStatus = (0,
                        _dom.elt)("span", null, this.mode)
                          , approval = (0,
                        _dom.elt)("span", {
                            "class": "comment-button"
                        }, "Approve")
                          , reject = (0,
                        _dom.elt)("span", {
                            "class": "comment-button"
                        }, "Reject");
                        approval.addEventListener("click", function(e) {
                            commentStore.approveComment(_this.id)
                        }),
                        reject.addEventListener("click", function(e) {
                            commentStore.removeComment(_this.id)
                        });
                        var approvalPanel = (0,
                        _dom.elt)("div", {
                            "class": "approval"
                        }, modeStatus, approval, reject);
                        this.dom = (0,
                        _dom.elt)("div", {
                            "class": "comment",
                            id: this.id
                        }, this.text, approvalPanel)
                    } else
                        this.dom = (0,
                        _dom.elt)("div", {
                            "class": "comment",
                            id: this.id
                        }, this.text);
                    return this.dom.addEventListener("click", function(e) {
                        e.stopPropagation();
                        var r = e.target.getBoundingClientRect();
                        e.clientX > r.right - 16 && e.clientY < r.top + 16 ? showMenu(_this, e.target.style.top) : "comment" == _this.dom.className ? commentStore.highlightComment(_this.id) : commentStore.clearHighlight()
                    }),
                    this.dom
                }
            }]),
            Comment
        }())
          , placetext = {
            comment: "Enter your comment",
            insert: "Enter text to insert",
            replace: "Enter text to replace",
            "delete": "Enter optional delete comment "
        }
          , CommentStore = exports.CommentStore = function() {
            function CommentStore(pm) {
                _classCallCheck(this, CommentStore),
                pm.mod.comments = this,
                this.pm = pm,
                this.comments = Object.create(null),
                this.unsent = [],
                this.highlight = null
            }
            return _createClass(CommentStore, [{
                key: "createComment",
                value: function(text, mode) {
                    var id = (0,
                    _utils.getID)()
                      , sel = this.pm.selection;
                    this.addComment(sel.from, sel.to, text, id, mode),
                    this.unsent.push({
                        type: "create",
                        id: id
                    }),
                    this.signal("mustSend")
                }
            }, {
                key: "addComment",
                value: function(from, to, text, id, mode) {
                    var _this2 = this;
                    if (!comments[id]) {
                        from == to && (to = from + 1);
                        var range = pm.markRange(from, to, {
                            className: "mode-" + mode
                        });
                        comments[id] = new Comment(id,text,range,mode),
                        commentsNode.appendChild(comments[id].newDom),
                        window.setTimeout(function() {
                            _this2.reflow(),
                            _this2.highlightComment(id)
                        }, 150)
                    }
                }
            }, {
                key: "removeComment",
                value: function(id) {
                    var found = comments[id];
                    return found ? (this.clearHighlight(),
                    found.range && pm.removeRange(found.range),
                    delete comments[id],
                    commentsNode.removeChild(found.dom),
                    void this.reflow()) : !1
                }
            }, {
                key: "approveComment",
                value: function(id) {
                    var found = comments[id];
                    if (found) {
                        switch (found.mode) {
                        case "insert":
                            pm.tr.insert(found.range.from, pm.schema.text(found.text)).apply(pm.apply.scroll);
                            break;
                        case "delete":
                            pm.tr["delete"](found.range.from, found.range.to).apply(pm.apply.scroll);
                            break;
                        case "replace":
                            pm.tr.replaceWith(found.range.from, found.range.to, pm.schema.text(found.text)).apply(pm.apply.scroll)
                        }
                        this.removeComment(id)
                    }
                }
            }, {
                key: "clearComments",
                value: function() {
                    comments.forEach(function(c) {
                        commentsNode.removeChild(c.dom)
                    })
                }
            }, {
                key: "renderComments",
                value: function() {
                    comments.forEach(function(c) {
                        commentsNode.appendChild(c.newDom)
                    }),
                    this.reflow()
                }
            }, {
                key: "reflow",
                value: function() {
                    var r = pm.content.getBoundingClientRect()
                      , sorted = [];
                    Object.keys(comments).forEach(function(id) {
                        var c = comments[id]
                          , top = Math.round(pm.coordsAtPos(c.range.from).top - r.top + 10);
                        sorted.push({
                            dom: c.dom,
                            top: top,
                            h: c.height
                        })
                    }),
                    sorted.sort(function(a, b) {
                        return a.top - b.top
                    });
                    var bottom = 20;
                    sorted.forEach(function(r) {
                        var top = r.top;
                        bottom > top && (top = bottom),
                        r.dom.style.top = top + "px",
                        bottom = top + r.h + 1
                    })
                }
            }, {
                key: "highlightComment",
                value: function(id) {
                    var c = comments[id];
                    if (c) {
                        this.clearHighlight(),
                        c.dom.className += " select",
                        this.highlight = c;
                        var _c$range = c.range
                          , from = _c$range.from
                          , to = _c$range.to;
                        pm.removeRange(c.range),
                        c.range = pm.markRange(from, to, {
                            className: c.getRangeClass(!0)
                        })
                    }
                }
            }, {
                key: "clearHighlight",
                value: function() {
                    if (this.highlight) {
                        var c = this.highlight;
                        if (c.dom.className = "comment",
                        c.range) {
                            var r = c.range
                              , from = r.from
                              , to = r.to;
                            pm.removeRange(r),
                            c.range = pm.markRange(from, to, {
                                className: c.getRangeClass(!1)
                            })
                        }
                        this.highlight = null
                    }
                }
            }, {
                key: "getSelectionTop",
                value: function() {
                    var from = pm.selection.from
                      , r = pm.coordsAtPos(from)
                      , rect = pm.content.getBoundingClientRect();
                    return Math.round(r.top - rect.top)
                }
            }]),
            CommentStore
        }();
        (0,
        _dom.insertCSS)('\n.comments {\n	display: block;\n	margin: 0 auto;\n	width: 100%;\n	height: 400px;\n}\n\n.comments .peer .ProseMirror-menubar {\n	text-align: right;\n}\n\n.comments #editor {\n	float: left;\n	width: 70%;\n	height: 100%;\n}\n\n.comments #comments {\n	border: 1px solid #AAA;\n	margin-left: 1px;\n	padding: 0;\n	height: 100%;\n	width: 300px;\n	display: inline-block;\n	overflow-y: auto;\n	position:relative;\n }\n\n\n.comments .comment-header {\n	font-weight: bold;\n	font-size: 80%;\n	width: 100%;\n	background: skyblue;\n	color: white;\n	margin: 0;\n	padding: 2px 2px 0px 2px;\n	border-bottom: 1px solid #AAA;\n	display: inline-block;\n}\n \n.comments .newcomment {\n	margin-left: 10px;\n	display: inline-block;\n}\n\n.comments .newcomment a {\n	padding: 0 4px 0 4px;\n	background: skyblue;\n	color: white;\n	text-decoration: none;\n}\n\n.comments .newcomment a:hover {\n	padding: 0 4px 0 4px;\n	background: white;\n	color: skyblue;\n	cursor: pointer;\n}\n\n.comments .comment {\n	background: white;\n	border-radius: 6px;\n	border: 1px solid #AAA;\n	width: 92%;\n	font-size: 90%;\n	padding: 4px;\n	min-height: 30px;\n	position: absolute;	\n	left: 8px;\n}\n\n.comments .comment:after {\n	content: \' \';\n	height: 0;\n	position: absolute;\n	width: 0;\n	border: 8px solid transparent;\n	border-right-color: skyblue;\n	left: -16px;\n	top: 5px;\n}\n\n.comments .comment:hover {\n	background-image: url(\'icons/menu.png\');\n	background-repeat: no-repeat;\n	background-position: top right;\n	cursor: pointer;\n}\n\n.comments .select {\n	border: 1px solid skyblue;\n}\n\n.comment-button {\n	margin: 4px;\n	padding: 2px;\n	border-radius: 4px;\n	border: 1px solid #AAA;\n	background: skyblue;\n	color: white;\n	cursor: pointer;\n}\n\n.addComment {\n	background: white;\n	margin: 2px;\n	border-radius: 6px;\n	border: 1px solid #AAA;\n	visibility: visible;\n	font-size: 80%;\n	padding: 4px;\n	display: inline-block;\n	position: absolute;\n	left: 0;\n	width: 93%;\n	z-index: 100;\n}\n\n.addComment textarea {\n	width: 95%;\n	resize: none;\n	margin: 4px;\n}\n\n.mode-comment {\n	background: skyblue;\n}\n\n\n.mode-comment-select {\n	background: dodgerblue;\n	color: white;\n}\n\n.mode-delete {\n	text-decoration: line-through;\n}\n\n.mode-delete-select {\n	text-decoration: line-through;\n	background: tomato;\n}\n\n.mode-insert:before {\n	content: "^";\n	font-width: bold;\n}\n\n.mode-insert-select:before {\n	content: "^";\n	background: turquoise;\n}\n\n.mode-replace {\n	text-decoration: overline;\n}\n\n.mode-replace-select {\n	text-decoration: overline;\n	background: violet;\n}\n\n.commentMenu {\n	font-size: 90%;\n	border: 1px solid #AAA;\n	display: none;\n	position:relative;\n	left: 180px;\n	width: 60px;\n	z-index: 100;\n	cursor: pointer;\n}\n\n.commentMenu ul {\n	display: block;\n    list-style-type: none;\n    margin: 0;\n    padding: 0;\n    overflow: hidden;\n    background-color: white;\n}\n\n.commentMenu li {\n}\n\n.commentMenu li span {\n    display: inline-block;\n    color: black;\n    padding: 1px;\n    text-decoration: none;\n}\n\n.commentMenu li span:hover {\n    background: skyblue;\n	color: white;\n}\n\n.hide, .approval, .mode {\n	display: none;\n}\n\n.show {\n	display: block;\n}\n\n.approval, .mode {\n	display: block;\n	font-size: 85%;\n	margin: 4px;\n}\n\n.approval span:first-child:after {\n	content: "?";\n	display: inline-block;\n	font-weight: bold;\n}\n\n')
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34,
        "prosemirror/dist/util/event": 53
    }],
    96: [function(require, module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor))
                throw new TypeError("Cannot call a class as a function")
        }
        function clearRanges() {
            granges && (granges.forEach(function(r) {
                return pm.removeRange(r)
            }),
            granges = null)
        }
        function clearComments() {
            for (; comments.lastChild; )
                comments.removeChild(comments.lastChild);
            comments.appendChild((0,
            _dom.elt)("div", {
                "class": "comment-header"
            }, "Comments"))
        }
        function clearPositions() {
            grammar.forEach(function(g) {
                return g.clear()
            })
        }
        function getGrammar(f) {
            grammar && f(),
            grammar = [];
            var xmlhttp = new XMLHttpRequest;
            xmlhttp.onreadystatechange = function() {
                4 == xmlhttp.readyState && 200 == xmlhttp.status && (JSON.parse(xmlhttp.responseText).forEach(function(g) {
                    grammar.push(new GrammarItem(g[0],g[1]))
                }),
                f())
            }
            ,
            xmlhttp.open("GET", "grammar.json", !0),
            xmlhttp.send()
        }
        function scanGrammar(doc) {
            function scan(node, offset) {
                var updatePath = node.isBlock && null != offset;
                updatePath && path.push(offset),
                node.isText && grammar.forEach(function(g) {
                    for (var m = void 0; m = g.regexp.exec(node.text); )
                        g.recordLoc(offset + m.index, offset + m.index + m[0].length, path)
                }),
                node.forEach(scan),
                updatePath && path.pop()
            }
            clearComments(),
            clearRanges(),
            clearPositions();
            var result = []
              , path = []
              , text = doc.textContent
              , psv = getPassive(text);
            return psv && grammar.push(psv),
            scan(doc),
            grammar.forEach(function(g) {
                g.loc.length > 0 && result.push(g)
            }),
            result.push(getStats(text)),
            psv && grammar.pop(),
            result
        }
        function getStats(text) {
            var stats = analyzer.stats(text)
              , tstats = {
                sentence: stats.sentences,
                word: stats.words,
                syllable: stats.syllables
            }
              , fstat = flesch(tstats).toFixed(1)
              , fkstat = fleschkincaid(tstats).toFixed(1)
              , msg = "There were " + stats.sentences + " sentences, " + stats.words + " words, and " + stats.syllables + " syllables. Flesch:" + fstat + ", FleschKincaid:" + fkstat;
            return new GrammarItem("Summary Statistics",msg);
        }
        function getPassive(text) {
            var passive = passivevoice(text);
            if (passive.length > 0) {
                var s = "";
                return passive.forEach(function(loc) {
                    s += text.substr(loc.index, loc.offset) + ","
                }),
                s = s.slice(0, -1),
                new GrammarItem(s,"Passive voice can be hard to read. Can you make it active?")
            }
            return null
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1,
                    descriptor.configurable = !0,
                    "value"in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor)
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            }
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }),
        exports.analyzeCmdSpec = void 0;
        var _dom = require("prosemirror/dist/dom")
          , _model = require("prosemirror/dist/model")
          , analyzer = (require("../../utils"),
        require("prosemirror/node_modules/text-stats"))
          , flesch = require("prosemirror/node_modules/flesch")
          , fleschkincaid = require("prosemirror/node_modules/flesch-kincaid")
          , passivevoice = require("prosemirror/node_modules/passive-voice")
          , comments = document.querySelector("#comments")
          , granges = null
          , selectedComment = null
          , grammar = (exports.analyzeCmdSpec = {
            label: "Analyze Grammar",
            select: function(pm) {
                return !0
            },
            run: function(pm) {
                return getGrammar(function() {
                    scanGrammar(pm.doc).forEach(function(g) {
                        comments.appendChild(g.dom)
                    })
                }),
                !0
            },
            menu: {
                group: "tool",
                rank: 72,
                display: {
                    type: "icon",
                    width: 8,
                    height: 8,
                    path: "M0 0v1h8v-1h-8zm0 2v1h5v-1h-5zm0 3v1h8v-1h-8zm0 2v1h6v-1h-6zm7.5 0c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"
                }
            }
        },
        null)
          , GrammarItem = function() {
            function GrammarItem(words, msg) {
                _classCallCheck(this, GrammarItem),
                this.words = words,
                this.msg = msg;
                var re = "";
                words.split(",").forEach(function(w) {
                    w = w.trim().replace(/\./g, "\\."),
                    w = "\\b" + w + "\\W",
                    re += w + "|"
                }),
                re = re.slice(0, -1),
                this.regexp = new RegExp(re,"ig"),
                this.clear()
            }
            return _createClass(GrammarItem, [{
                key: "clear",
                value: function() {
                    this.loc = []
                }
            }, {
                key: "recordLoc",
                value: function(from, to, path) {
                    from = new _model.Pos(path.slice(),from),
                    to = null == to ? from : new _model.Pos(from.path,to),
                    this.loc.push({
                        from: from,
                        to: to
                    })
                }
            }, {
                key: "dom",
                get: function() {
                    var _this = this
                      , msg = (0,
                    _dom.elt)("div", {
                        "class": "message-hide"
                    }, this.msg)
                      , icon = (0,
                    _dom.elt)("img", {
                        src: "icons/question-mark.png",
                        title: "Why?"
                    });
                    icon.addEventListener("click", function() {
                        msg.className = "message-hide" == msg.className ? "message-show" : "message-hide"
                    });
                    var dom = (0,
                    _dom.elt)("div", {
                        "class": "comment"
                    }, (0,
                    _dom.elt)("div", {
                        "class": "words"
                    }, this.words), icon, msg);
                    return dom.addEventListener("click", function() {
                        clearRanges(),
                        granges = [],
                        selectedComment && (selectedComment.className = "comment"),
                        dom.className += " selected",
                        selectedComment = dom,
                        _this.loc.forEach(function(loc) {
                            var from = loc.from
                              , to = loc.to;
                            granges.push(pm.markRange(from, to, {
                                className: "highlight-word"
                            }))
                        })
                    }),
                    dom
                }
            }]),
            GrammarItem
        }();
        (0,
        _dom.insertCSS)("\n.grammar {\n	display: block;\n	margin: 0 auto;\n	width: 100%;\n	height: 400px;\n}\n		\n.grammar #editor {\n	float: left;\n	width: 70%;\n	height: 100%;\n}\n\n.grammar #comments {\n	border: 1px solid #AAA;\n	margin-left: 2px;\n	padding: 0;\n	height: 100%;\n	width: 250px;\n	display: inline-block;\n	vertical-align: top;\n	overflow: scroll;\n }\n\n.grammar .comment-header {\n	font-weight: bold;\n	font-size: 80%;\n	width: 100%;\n	background: skyblue;\n	color: white;\n	margin: 0;\n	padding: 4px;\n	border-bottom: 1px solid #AAA;\n}\n\n.grammar .comment {\n	margin: 2px;\n	border-radius: 4px;\n	border: 1px solid #AAA;\n	padding: 2px;\n	font-size: 14px;\n}\n\n.grammar .comment img {\n	float: right;\n	cursor: pointer;\n}\n\n.grammar .comment .words {\n	padding: 2px;\n	color: blue;\n}\n\n.grammar .comment .message-hide {\n	visibility: hidden;\n	padding: 2px;	\n}\n\n.grammar .comment .message-show {\n	visibility: visible;\n	padding: 2px;	\n}\n\n.selected {\n	background: #EEE;\n}\n\n.highlight-word {\n	background: yellow;\n}\n\n")
    }
    , {
        "../../utils": 65,
        "prosemirror/dist/dom": 1,
        "prosemirror/dist/model": 34,
        "prosemirror/node_modules/flesch": 60,
        "prosemirror/node_modules/flesch-kincaid": 59,
        "prosemirror/node_modules/passive-voice": 61,
        "prosemirror/node_modules/text-stats": 62
    }],
    97: [function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var _grammar = require("./grammar");
        Object.defineProperty(exports, "analyzeCmdSpec", {
            enumerable: !0,
            get: function() {
                return _grammar.analyzeCmdSpec
            }
        });
        var _comment = require("./comment");
        Object.defineProperty(exports, "commentCmdSpec", {
            enumerable: !0,
            get: function() {
                return _comment.commentCmdSpec
            }
        }),
        Object.defineProperty(exports, "initComments", {
            enumerable: !0,
            get: function() {
                return _comment.initComments
            }
        })
    }
    , {
        "./comment": 95,
        "./grammar": 96
    }]
}, {}, [63]);
