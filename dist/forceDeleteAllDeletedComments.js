"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
dotenv_1.default.config({ path: '.env.local' });
var next_sanity_1 = require("next-sanity");
function assertValue(value, errorMessage) {
    if (!value)
        throw new Error(errorMessage);
    return value;
}
var apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-02';
var dataset = assertValue(process.env.NEXT_PUBLIC_SANITY_DATASET, 'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET');
var projectId = assertValue(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID');
var token = assertValue(process.env.SANITY_WRITE_TOKEN, 'Missing environment variable: SANITY_WRITE_TOKEN');
var client = (0, next_sanity_1.createClient)({
    projectId: projectId,
    dataset: dataset,
    apiVersion: apiVersion,
    useCdn: false,
});
var writeClient = (0, next_sanity_1.createClient)({
    projectId: projectId,
    dataset: dataset,
    apiVersion: apiVersion,
    useCdn: false,
    token: token,
});
function forceDeleteComment(commentId) {
    return __awaiter(this, void 0, void 0, function () {
        var comment, childComments, _i, childComments_1, child, allDocsWithRef, _a, allDocsWithRef_1, doc, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 15, , 16]);
                    return [4 /*yield*/, client.fetch("*[_type == \"comment\" && _id == $id][0]{_id, text, startup, parent, author->{name}}", { id: commentId })];
                case 1:
                    comment = _b.sent();
                    if (!comment) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, client.fetch("*[_type == \"comment\" && parent._ref == $commentId]{_id}", { commentId: commentId })];
                case 2:
                    childComments = _b.sent();
                    _i = 0, childComments_1 = childComments;
                    _b.label = 3;
                case 3:
                    if (!(_i < childComments_1.length)) return [3 /*break*/, 6];
                    child = childComments_1[_i];
                    return [4 /*yield*/, forceDeleteComment(child._id)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, client.fetch("*[references($commentId)]{_id, _type}", { commentId: commentId })];
                case 7:
                    allDocsWithRef = _b.sent();
                    _a = 0, allDocsWithRef_1 = allDocsWithRef;
                    _b.label = 8;
                case 8:
                    if (!(_a < allDocsWithRef_1.length)) return [3 /*break*/, 13];
                    doc = allDocsWithRef_1[_a];
                    if (!(doc._type === 'startup')) return [3 /*break*/, 10];
                    return [4 /*yield*/, writeClient.patch(doc._id).unset(["comments[_ref==\"".concat(commentId, "\"]")]).commit()];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 10:
                    if (!(doc._type === 'comment')) return [3 /*break*/, 12];
                    return [4 /*yield*/, writeClient.patch(doc._id).unset(["replies[_ref==\"".concat(commentId, "\"]")]).commit()];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 8];
                case 13: 
                // Delete the comment itself
                return [4 /*yield*/, writeClient.delete(commentId)];
                case 14:
                    // Delete the comment itself
                    _b.sent();
                    console.log("\u2705 Deleted comment ".concat(commentId));
                    return [3 /*break*/, 16];
                case 15:
                    error_1 = _b.sent();
                    console.error("\u274C Error deleting comment ".concat(commentId, ":"), error_1);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var deletedComments, _i, deletedComments_1, comment, stillDeleted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.fetch("*[_type == \"comment\" && deleted == true]{_id}")];
                case 1:
                    deletedComments = _a.sent();
                    if (deletedComments.length === 0) {
                        console.log('✅ No deleted comments found!');
                        return [2 /*return*/];
                    }
                    console.log("\uD83E\uDDF9 Found ".concat(deletedComments.length, " deleted comments. Starting recursive force delete..."));
                    _i = 0, deletedComments_1 = deletedComments;
                    _a.label = 2;
                case 2:
                    if (!(_i < deletedComments_1.length)) return [3 /*break*/, 5];
                    comment = deletedComments_1[_i];
                    return [4 /*yield*/, forceDeleteComment(comment._id)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, client.fetch("*[_type == \"comment\" && deleted == true]{_id}")];
                case 6:
                    stillDeleted = _a.sent();
                    if (stillDeleted.length === 0) {
                        console.log('🎉 All deleted comments have been force deleted!');
                    }
                    else {
                        console.log("\u26A0\uFE0F  ".concat(stillDeleted.length, " deleted comments still remain (check for reference cycles)"));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error('❌ Error:', err);
    process.exit(1);
});
