// ==========================================
// 1. ส่วนตั้งค่า (CONFIG & IMPORTS)
// ==========================================
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { initializeApp } = require("firebase-admin/app");

// ✅ แก้ไขส่วนนี้: ประกาศครั้งเดียว และนำเข้า FieldValue ให้ถูกต้อง
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ==========================================
// 1. DATA (จาก gs.txt ของคุณ)
// ==========================================
const SYMBOLS_OLD = ['●', '○', '■', '□', '◆', '◇', 'x', '+', '✦', '✧', '', '◉', '◎'];
const SYMBOLS_NEW = ['↑', '⇧', '▲', '◖', '◮', '♠', '♥', '♤', '♡', '♣', '♧', '♫', '♀', '♂', 'Δ', 'Ω', 'β', 'ψ', 'ω', '★', '☆', '1', '2', '3', '4', '5', '7', 'A', 'B', 'C', 'D', 'Y', 'Z', 'W', 'K', 'G', '✞', '☟', '☯', '☺', '☻', '☾', '♪', '♮', '⚐', '⚑', '⚓', '⚔', '⚖', '⚡', '⚢', '⚤', '🗽', '✈️', '🎧', '⚕', '🔥', '✔', '🌳', '🌵', '🔒', '✏️', '💔', '🚗', '🗼', '☠', '☮', '🍎', '♨'];

// *** สำคัญ: ก๊อปปี้ GAME_DATA และ GAME_DATA_ROTATED จาก gs.txt ของคุณมาวางตรงนี้ให้ครบถ้วนนะครับ ***
const GAME_DATA = [
    {
        'pattern': [[null, '2', '1', null], [null, '3', null, null], [null, '4', null, null], ['6', '5', null, null]], 'answers': [[1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 2], [2, 3, 1], [2, 1, 5], [2, 5, 6], [2, 6, 3], [3, 4, 1], [3, 1, 2], [3, 2, 6], [3, 6, 4], [4, 6, 5], [4, 5, 1], [4, 1, 3], [4, 3, 6], [5, 4, 6], [5, 6, 2], [5, 2, 1], [5, 1, 4], [6, 5, 4], [6,
            4, 3], [6, 3, 2], [6, 2, 5]], 'foldedbox': ['1', '3', '4', '2', '5', '6']
    },
    {
        'pattern': [['1', '2', null, null], [null, '3', null, null], [null, '4', null, null], [null, '5', '6', null]], 'answers': [[1, 5, 4], [1, 4, 3], [1, 3, 2], [1, 2, 5], [2, 1, 3], [2, 3, 6], [2, 6, 5], [2, 5, 1], [3, 4, 6], [3, 6, 2], [3, 2, 1], [3, 1, 4], [4, 5, 6], [4, 6, 3], [4, 3, 1], [4, 1, 5], [5, 6, 4], [5, 4, 1], [5, 1, 2], [5, 2, 6], [6, 2,
            3], [6, 3, 4], [6, 4, 5], [6, 5, 2]], 'foldedbox': ['1', '3', '2', '4', '5', '6']
    },
    {
        // Pattern ที่ 3 (แก้ foldedbox)
        'pattern': [[null, null, '1', null], [null, '3', '2', null], ['5', '4', null, null], [null, '6', null, null]],
        'answers': [[1, 3, 2], [1, 2, 6], [1, 6, 5], [1, 5, 3], [2, 3, 4], [2, 4, 6], [2, 6, 1], [2, 1, 3], [3, 5, 4], [3, 4, 2], [3, 2, 1], [3, 1, 5], [4, 3, 5], [4, 5, 6], [4, 6, 2], [4, 2, 3], [5, 6, 4], [5, 4, 3], [5, 3, 1], [5, 1, 6], [6, 1, 2], [6, 2, 4], [6, 4, 5], [6, 5, 1]],
        'foldedbox': ['1', '2', '6', '3', '5', '4']
        // Note: เช็ค Logic พับ: 1=Top, 2=Left, 6=Front, 3=Back, 5=Right, 4=Bottom
    },
    {
        // Pattern ที่ 4 (แก้ foldedbox)
        'pattern': [['1', null, null, null], ['2', '3', null, null], [null, '4', '5', null], [null, '6', null, null]],
        'answers': [[1, 2, 3], [1, 3, 5], [1, 5, 6], [1, 6, 2], [2, 4, 3], [2, 3, 1], [2, 1, 6], [2, 6, 4], [3, 1, 2], [3, 2, 4], [3, 4, 5], [3, 5, 1], [4, 5, 3], [4, 3, 2], [4, 2, 6], [4, 6, 5], [5, 1, 3], [5, 3, 4], [5, 4, 6], [5, 6, 1], [6, 5, 4], [6, 4, 2], [6, 2, 1], [6, 1, 5]],
        'foldedbox': ['1', '2', '3', '6', '5', '4']
        // Note: เช็ค Logic พับ: 1=Top, 2=Left, 3=Front, 6=Back, 5=Right, 4=Bottom
    },
    {
        'pattern': [['1', '2', null, null], [null, '3', '4', null], [null, '5', null, null], [null, '6', null, null]], 'answers': [[1, 6, 5], [1, 5, 3], [1, 3, 2], [1, 2, 6], [2, 1, 3], [2, 3, 4], [2, 4, 6], [2, 6, 1], [3, 1, 5], [3, 5, 4], [3, 4, 2], [3, 2, 1], [4, 3, 5], [4, 5, 6], [4, 6, 2], [4, 2, 3], [5, 6, 4], [5, 4, 3], [5, 3,
            1], [5, 1, 6], [6, 2, 4], [6, 4, 5], [6, 5, 1], [6, 1, 2]], 'foldedbox': ['1', '3', '2', '5', '6', '4']
    },
    {
        'pattern': [[null, '2', '1', null], ['4', '3', null, null], [null, '5', null, null], [null, '6', null, null]], 'answers': [[1, 2, 3], [1, 3, 5], [1, 5, 6], [1, 6, 2], [2, 4, 3], [2, 3, 1], [2, 1, 6], [2, 6, 4], [3, 2, 4], [3, 4, 5], [3, 5, 1], [3, 1, 2], [4, 6, 5], [4, 5, 3], [4, 3, 2], [4, 2, 6], [5, 4, 6], [5, 6, 1],
        [5, 1, 3], [5, 3, 4], [6, 5, 4], [6, 4, 2], [6, 2, 1], [6, 1, 5]], 'foldedbox': ['1', '3', '5', '2', '6', '4']
    },
    {
        'pattern': [[null, '1', null, null], ['3', '2', null, null], [null, '4', '5', null], [null, '6', null, null]], 'answers': [[1, 3, 2], [1, 2, 5], [1, 5, 6], [1, 6, 3], [2, 1, 3], [2, 3, 4], [2, 4, 5], [2, 5, 1], [3, 4, 2], [3, 2, 1], [3, 1, 6], [3, 6, 4], [4, 6, 5], [4, 5, 2], [4, 2, 3], [4, 3, 6], [5, 1, 2], [5,
            2, 4], [5, 4, 6], [5, 6, 1], [6, 5, 4], [6, 4, 3], [6, 3, 1], [6, 1, 5]], 'foldedbox': ['1', '2', '5', '3', '6', '4']
    },
    {
        'pattern': [[null, '1', null, null], [null, '2', '3', null], ['5', '4', null, null], [null, '6', null, null]], 'answers': [[1, 2, 3], [1, 3, 6], [1, 6, 5], [1, 5, 2], [2, 4, 3], [2, 3, 1], [2, 1, 5], [2, 5, 4], [3, 1, 2], [3, 2, 4], [3, 4, 6], [3, 6, 1], [4, 5, 6], [4, 6, 3], [4, 3, 2], [4, 2, 5], [5, 6,
            4], [5, 4, 2], [5, 2, 1], [5, 1, 6], [6, 5, 1], [6, 1, 3], [6, 3, 4], [6, 4, 5]], 'foldedbox': ['1', '2', '3', '5', '6', '4']
    },
    {
        'pattern': [[null, '1', null, null], [null, '2', null, null], ['3', '4', '5', null], [null, '6', null, null]], 'answers': [[1, 2, 5], [1, 5, 6], [1, 6, 3], [1, 3, 2], [2, 3, 4], [2, 4, 5], [2, 5, 1], [2, 1, 3], [3, 6, 4], [3, 4, 2], [3, 2, 1], [3, 1, 6], [4, 3, 6], [4, 6, 5], [4, 5, 2], [4, 2, 3],
        [5, 1, 2], [5, 2, 4], [5, 4, 6], [5, 6, 1], [6, 1, 5], [6, 5, 4], [6, 4, 3], [6, 3, 1]], 'foldedbox': ['1', '2', '5', '3', '6', '4']
    },
    {
        'pattern': [[null, '1', null, null], ['2', '3', '4', null], [null, '5', null, null], [null, '6', null, null]], 'answers': [[1, 2, 3], [1, 3, 4], [1, 4, 6], [1, 6, 2], [2, 6, 5], [2, 5, 3], [2, 3, 1], [2, 1, 6], [3, 2, 5], [3, 5, 4], [3, 4, 1], [3, 1, 2], [4, 1, 3], [4, 3, 5], [4, 5, 6], [4,
            6, 1], [5, 2, 6], [5, 6, 4], [5, 4, 3], [5, 3, 2], [6, 5, 2], [6, 2, 1], [6, 1, 4], [6, 4, 5]], 'foldedbox': ['1', '3', '4', '2', '6', '5']
    },
    {
        'pattern': [['1', '2', '3', null], [null, '4', null, null], [null, '5', null, null], [null, '6', null, null]], 'answers': [[1, 2, 4], [1, 4, 5], [1, 5, 6], [1, 6, 2], [2, 4, 3], [2, 3, 6], [2, 6, 1], [2, 1, 4], [3, 4, 5], [3, 5, 6], [3, 6, 2], [3, 2, 4], [4, 5, 3], [4, 3, 2], [4, 2,
            1], [4, 1, 5], [5, 6, 3], [5, 3, 4], [5, 4, 1], [5, 1, 6], [6, 2, 3], [6, 3, 5], [6, 5, 1], [6, 1, 2]], 'foldedbox': ['1', '4', '2', '5', '6', '3']
    },
    {
        'pattern': [[null, '1', null, null], [null, '2', null, null], [null, '3', null, null], ['4', '5', '6', null]], 'answers': [[1, 2, 6], [1, 6, 5], [1, 5, 4], [1, 4, 2], [2, 3, 6], [2, 6, 1], [2, 1, 4], [2, 4, 3], [3, 4, 5], [3, 5, 6], [3, 6, 2], [3, 2, 4], [4, 5, 3], [4, 3, 2],
        [4, 2, 1], [4, 1, 5], [5, 6, 3], [5, 3, 4], [5, 4, 1], [5, 1, 6], [6, 3, 5], [6, 5, 1], [6, 1, 2], [6, 2, 3]], 'foldedbox': ['1', '2', '6', '4', '5', '3']
    }
];
const GAME_DATA_ROTATED = [
    {
        'pattern': [[null, '2', '1', null], [null, '3', null, null], [null, '4', null, null], ['6', '5', null, null]], 'answers': [['1U', '3L', '4L'], ['1R', '4L', '5L'], ['1D', '5L', '2L'], ['1L', '2L', '3L'], ['2U', '3U', '1R'], ['2R', '1R', '5D'], ['2D', '5D', '6D'], ['2L', '6D', '3U'], ['3U', '4U', '1D'], ['3R', '1D', '2D'], ['3D', '2D', '6R'], ['3L', '6R', '4U'], ['4U', '5U', '1L'], ['4R', '1L', '3D'], ['4D', '3D', '6U'], ['4L', '6U', '5U'], ['5U', '2U', '1U'], ['5R', '1U', '4D'], ['5D', '4D', '6L'], ['5L', '6L', '2U'], ['6U', '2R', '5R'], ['6R', '5R', '4R'], ['6D', '4R', '3R'], ['6L', '3R', '2R']], 'foldedbox': ['1U',
            '3L', '4L', '2L', '5L', '6R']
    },
    {
        'pattern': [['1', '2', null, null], [null, '3', null, null], [null, '4', null, null], [null, '5', '6', null]], 'answers': [['1U', '3R', '2R'], ['1R', '2R', '5R'], ['1D', '5R', '4R'], ['1L', '4R', '3R'], ['2U', '3U', '6D'], ['2R', '6D', '5D'], ['2D', '5D', '1L'], ['2L', '1L', '3U'], ['3U', '4U', '6L'], ['3R', '6L', '2D'], ['3D', '2D', '1D'], ['3L', '1D', '4U'], ['4U', '5U', '6U'], ['4R', '6U', '3D'], ['4D', '3D', '1R'], ['4L', '1R', '5U'], ['5U', '2U', '6R'], ['5R', '6R', '4D'], ['5D', '4D', '1U'], ['5L', '1U', '2U'], ['6U', '2L', '3L'], ['6R', '3L', '4L'], ['6D', '4L', '5L'], ['6L', '5L', '2L']],
        'foldedbox': ['1U', '3R', '2R', '4R', '5R', '6L']
    },
    {
        'pattern': [[null, null, '1', null], [null, '3', '2', null], ['5', '4', null, null], [null, '6', null, null]], 'answers': [['1U', '2U', '6D'], ['1R', '6D', '5R'], ['1D', '5R', '3U'], ['1L', '3U', '2U'], ['2U', '4L', '6L'], ['2R', '6L', '1D'], ['2D', '1D', '3L'], ['2L', '3L', '4L'], ['3U', '4U', '2R'], ['3R', '2R', '1R'], ['3D', '1R', '5U'], ['3L', '5U', '4U'], ['4U', '6U', '2D'], ['4R', '2D', '3D'], ['4D', '3D', '5L'], ['4L', '5L', '6U'], ['5U', '6R', '4R'], ['5R', '4R', '3R'], ['5D', '3R', '1U'], ['5L', '1U', '6R'], ['6U', '1L', '2L'], ['6R', '2L', '4D'], ['6D', '4D', '5D'], ['6L',
            '5D', '1L']], 'foldedbox': ['1U', '2U', '6D', '3U', '5R', '4L']
    },
    {
        'pattern': [['1', null, null, null], ['2', '3', null, null], [null, '4', '5', null], [null, '6', null, null]], 'answers': [['1U', '2U', '3U'], ['1R', '3U', '5L'], ['1D', '5L', '6D'], ['1L', '6D', '2U'], ['2U', '4R', '3R'], ['2R', '3R', '1D'], ['2D', '1D', '6R'], ['2L', '6R', '4R'], ['3U', '4U', '5U'], ['3R', '5U', '1L'], ['3D', '1L', '2L'], ['3L', '2L', '4U'], ['4U', '6U', '5R'], ['4R', '5R', '3D'], ['4D', '3D', '2D'], ['4L', '2D', '6U'], ['5U', '6L', '1U'], ['5R', '1U', '3L'], ['5D', '3L', '4L'], ['5L', '4L', '6L'], ['6U', '1R', '5D'], ['6R', '5D', '4D'], ['6D', '4D',
            '2R'], ['6L', '2R', '1R']], 'foldedbox': ['1U', '2U', '3U', '6D', '5L', '4R']
    },
    {
        'pattern': [['1', '2', null, null], [null, '3', '4', null], [null, '5', null, null], [null, '6', null, null]], 'answers': [['1U', '3R', '2R'], ['1R', '2R', '6R'], ['1D', '6R', '5R'], ['1L', '5R', '3R'], ['2U', '3U', '4U'], ['2R', '4U', '6D'], ['2D', '6D', '1L'], ['2L', '1L', '3U'], ['3U', '5U', '4R'], ['3R', '4R', '2D'], ['3D', '2D', '1D'], ['3L', '1D', '5U'], ['4U', '5L', '6L'], ['4R', '6L', '2L'], ['4D', '2L', '3L'], ['4L', '3L', '5L'], ['5U', '6U', '4D'], ['5R', '4D', '3D'], ['5D', '3D', '1R'], ['5L', '1R', '6U'], ['6U', '2U', '4L'], ['6R', '4L', '5D'],
        ['6D', '5D', '1U'], ['6L', '1U', '2U']], 'foldedbox': ['1U', '3R', '2R', '5R', '6R', '4R']
    },
    {
        'pattern': [[null, '2', '1', null], ['4', '3', null, null], [null, '5', null, null], [null, '6', null, null]], 'answers': [['1U', '3L', '5L'], ['1R', '5L', '6L'], ['1D', '6L', '2L'], ['1L', '2L', '3L'], ['2U', '3U', '1R'], ['2R', '1R', '6D'], ['2D', '6D', '4U'], ['2L', '4U', '3U'], ['3U', '5U', '1D'], ['3R', '1D', '2D'], ['3D', '2D', '4L'], ['3L', '4L', '5U'], ['4U', '5R', '3R'], ['4R', '3R', '2R'], ['4D', '2R', '6R'], ['4L', '6R', '5R'], ['5U', '6U', '1L'], ['5R', '1L', '3D'], ['5D', '3D', '4D'], ['5L', '4D', '6U'], ['6U', '2U', '1U'], ['6R',
            '1U', '5D'], ['6D', '5D', '4R'], ['6L', '4R', '2U']], 'foldedbox': ['1U', '3L', '5L', '2L', '6L', '4L']
    },
    {
        'pattern': [[null, '1', null, null], ['3', '2', null, null], [null, '4', '5', null], [null, '6', null, null]], 'answers': [['1U', '2U', '5L'], ['1R', '5L', '6D'], ['1D', '6D', '3U'], ['1L', '3U', '2U'], ['2U', '4U', '5U'], ['2R', '5U', '1D'], ['2D', '1D', '3L'], ['2L', '3L', '4U'], ['3U', '4R', '2R'], ['3R', '2R', '1R'], ['3D', '1R', '6R'], ['3L', '6R', '4R'], ['4U', '6U', '5R'], ['4R', '5R', '2D'], ['4D', '2D', '3D'], ['4L', '3D', '6U'], ['5U', '6L', '1L'], ['5R', '1L', '2L'], ['5D', '2L', '4L'], ['5L', '4L', '6L'], ['6U', '1U',
            '5D'], ['6R', '5D', '4D'], ['6D', '4D', '3R'], ['6L', '3R', '1U']], 'foldedbox': ['1U', '2U', '5L', '3U', '6D', '4U']
    },
    {
        'pattern': [[null, '1', null, null], [null, '2', '3', null], ['5', '4', null, null], [null, '6', null, null]], 'answers': [['1U', '2U', '3U'], ['1R', '3U', '6D'], ['1D', '6D', '5R'], ['1L', '5R', '2U'], ['2U', '4U', '3R'], ['2R', '3R', '1D'], ['2D', '1D', '5U'], ['2L', '5U', '4U'], ['3U', '4L', '6L'], ['3R', '6L', '1L'], ['3D', '1L', '2L'], ['3L', '2L', '4L'], ['4U', '6U', '3D'], ['4R', '3D', '2D'], ['4D', '2D', '5L'], ['4L', '5L', '6U'], ['5U', '6R', '4R'], ['5R', '4R', '2R'], ['5D', '2R', '1R'], ['5L', '1R', '6R'],
        ['6U', '1U', '3L'], ['6R', '3L', '4D'], ['6D', '4D', '5D'], ['6L', '5D', '1U']], 'foldedbox': ['1U', '2U', '3U', '5R', '6D', '4U']
    },
    {
        'pattern': [[null, '1', null, null], [null, '2', null, null], ['3', '4', '5', null], [null, '6', null, null]], 'answers': [['1U', '2U', '5L'], ['1R', '5L', '6D'], ['1D', '6D', '3R'], ['1L', '3R', '2U'], ['2U', '4U', '5U'], ['2R', '5U', '1D'], ['2D', '1D', '3U'], ['2L', '3U', '4U'], ['3U', '6R', '4R'], ['3R', '4R', '2R'], ['3D', '2R', '1R'], ['3L', '1R', '6R'], ['4U', '6U', '5R'], ['4R', '5R', '2D'], ['4D', '2D', '3L'], ['4L', '3L', '6U'], ['5U', '6L', '1L'], ['5R', '1L', '2L'], ['5D', '2L', '4L'], ['5L',
            '4L', '6L'], ['6U', '1U', '5D'], ['6R', '5D', '4D'], ['6D', '4D', '3D'], ['6L', '3D', '1U']], 'foldedbox': ['1U', '2U', '5L', '3R', '6D', '4U']
    },
    {
        'pattern': [[null, '1', null, null], ['2', '3', '4', null], [null, '5', null, null], [null, '6', null, null]], 'answers': [['1U', '3U', '4U'], ['1R', '4U', '6D'], ['1D', '6D', '2U'], ['1L', '2U', '3U'], ['2U', '5R', '3R'], ['2R', '3R', '1R'], ['2D', '1R', '6R'], ['2L', '6R', '5R'], ['3U', '5U', '4R'], ['3R', '4R', '1D'], ['3D', '1D', '2L'], ['3L', '2L', '5U'], ['4U', '5L', '6L'], ['4R', '6L', '1L'], ['4D', '1L', '3L'], ['4L', '3L', '5L'], ['5U', '6U', '4D'], ['5R', '4D', '3D'], ['5D', '3D',
            '2D'], ['5L', '2D', '6U'], ['6U', '1U', '4L'], ['6R', '4L', '5D'], ['6D', '5D', '2R'], ['6L', '2R', '1U']], 'foldedbox': ['1U', '3U', '4U', '2U', '6D', '5U']
    },
    {
        'pattern': [['1', '2', '3', null], [null, '4', null, null], [null, '5', null, null], [null, '6', null, null]], 'answers': [['1U', '4R', '2R'], ['1R', '2R', '6R'], ['1D', '6R', '5R'], ['1L', '5R', '4R'], ['2U', '4U', '3R'], ['2R', '3R', '6D'], ['2D', '6D', '1L'], ['2L', '1L', '4U'], ['3U', '4L', '5L'], ['3R', '5L', '6L'], ['3D', '6L', '2L'], ['3L', '2L', '4L'], ['4U', '5U', '3D'], ['4R', '3D', '2D'], ['4D', '2D', '1D'], ['4L', '1D', '5U'], ['5U', '6U', '3L'], ['5R', '3L', '4D'],
        ['5D', '4D', '1R'], ['5L', '1R', '6U'], ['6U', '2U', '3U'], ['6R', '3U', '5D'], ['6D', '5D', '1U'], ['6L', '1U', '2U']], 'foldedbox': ['1U', '4R', '2R', '5R', '6R', '3D']
    },
    {
        'pattern': [[null, '1', null, null], [null, '2', null, null], [null, '3', null, null], ['4', '5', '6', null]], 'answers': [['1U', '2U', '6D'], ['1R', '6D', '5D'], ['1D', '5D', '4D'], ['1L', '4D', '2U'], ['2U', '3U', '6L'], ['2R', '6L', '1D'], ['2D', '1D', '4R'], ['2L', '4R', '3U'], ['3U', '5U', '6U'], ['3R', '6U', '2D'], ['3D', '2D', '4U'], ['3L', '4U', '5U'], ['4U', '1R', '5R'], ['4R', '5R', '3R'], ['4D', '3R', '2R'], ['4L', '2R', '1R'], ['5U', '1U', '6R'], ['5R',
            '6R', '3D'], ['5D', '3D', '4L'], ['5L', '4L', '1U'], ['6U', '1L', '2L'], ['6R', '2L', '3L'], ['6D', '3L', '5L'], ['6L', '5L', '1L']], 'foldedbox': ['1U', '2U', '6D', '4D', '5D', '3U']
    },
];

// ==========================================
// 2. LOGIC (จาก gs.txt ของคุณ เป๊ะๆ)
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateSymbolMapping(type = 'old') {
    const symbolSet = (type === 'rotated') ? SYMBOLS_NEW : SYMBOLS_OLD;
    // Clone array เพื่อไม่ให้กระทบตัวแปร Global
    let availableSymbols = [...symbolSet];
    // เผื่อกรณี symbol ไม่พอ (กันเหนียว)
    while (availableSymbols.length < 6) {
        availableSymbols = availableSymbols.concat([...symbolSet]);
    }

    let mapping = {};
    for (let i = 1; i <= 6; i++) {
        let randomIndex = Math.floor(Math.random() * availableSymbols.length);
        // ดึงออกมาแล้วลบออกจาก list เพื่อไม่ให้ซ้ำ
        mapping[i.toString()] = availableSymbols.splice(randomIndex, 1)[0];
    }
    return mapping;
}

function generateQuestionData(type = 'old', difficulty = 'normal') {
    // 1. สร้าง Symbol Mapping
    const symbolMapping = generateSymbolMapping(type);
    // 2. เลือก Template โจทย์
    const sourceData = (type === 'rotated') ? GAME_DATA_ROTATED : GAME_DATA;
    let qTemplate = sourceData[Math.floor(Math.random() * sourceData.length)];

    // Clone เพื่อไม่ให้กระทบข้อมูลต้นฉบับ
    let correctAnswers = JSON.parse(JSON.stringify(qTemplate.answers));
    // --- START: HELL MODE LOGIC (8 Choices) ---
    if (difficulty === 'hell') {
        const numCorrect = Math.floor(Math.random() * 5) + 1;
        // 1 ถึง 5
        const numIncorrect = 8 - numCorrect;

        shuffleArray(correctAnswers);
        let correctChoices = correctAnswers.slice(0, numCorrect);

        const usedChoices = new Set(correctAnswers.map(ans =>
            (type === 'rotated')
                ? [...ans].sort().join('-')
                : [...ans].sort((a, b) => a - b).join('-')
        ));
        let incorrectChoices = [];
        let maxAttempts = 100;

        if (type === 'rotated') {
            while (incorrectChoices.length < numIncorrect && maxAttempts > 0) {
                let nums = [];
                let faces = ['U', 'D', 'L', 'R'];
                while (nums.length < 3) {
                    let n = Math.floor(Math.random() * 6) + 1;
                    let f = faces[Math.floor(Math.random() * faces.length)];
                    let faceStr = `${n}${f}`;
                    if (!nums.some(item => item.startsWith(n))) nums.push(faceStr);
                }
                nums.sort();
                if (!usedChoices.has(nums.join('-'))) {
                    incorrectChoices.push(nums);
                    usedChoices.add(nums.join('-'));
                }
                maxAttempts--;
            }
        } else { // 'old' type hell mode
            while (incorrectChoices.length < numIncorrect && maxAttempts > 0) {
                let nums = [];
                while (nums.length < 3) {
                    let n = Math.floor(Math.random() * 6) + 1;
                    if (!nums.includes(n)) nums.push(n);
                }
                nums.sort((a, b) => a - b);
                if (!usedChoices.has(nums.join('-'))) {
                    incorrectChoices.push(nums);
                    usedChoices.add(nums.join('-'));
                }
                maxAttempts--;
            }
        }

        let choices = [...correctChoices, ...incorrectChoices];
        shuffleArray(choices);

        let questionData = {
            pattern: qTemplate.pattern,
            choices: choices.slice(0, 8), // Ensure exactly 8 choices
            correctChoices: correctChoices, // Array of correct answers
            symbolMapping: symbolMapping,
            type: type
        };
        if (qTemplate.foldedbox) {
            questionData.foldedbox = qTemplate.foldedbox;
        }
        return questionData;
    }
    // --- END: HELL MODE LOGIC ---

    // --- ORIGINAL LOGIC (for Easy, Normal, Hard) ---
    let correctChoice = correctAnswers[Math.floor(Math.random() * correctAnswers.length)];
    const usedChoices = new Set(correctAnswers.map(ans =>
        (type === 'rotated')
            ? [...ans].sort().join('-')
            : [...ans].sort((a, b) => a - b).join('-')
    ));
    let incorrectChoices = [];
    let maxAttempts = 100;

    if (type === 'rotated') {
        while (incorrectChoices.length < 3 && maxAttempts > 0) {
            let nums = [];
            let faces = ['U', 'D', 'L', 'R'];
            while (nums.length < 3) {
                let n = Math.floor(Math.random() * 6) + 1;
                let f = faces[Math.floor(Math.random() * faces.length)];
                let faceStr = `${n}${f}`;
                if (!nums.some(item => item.startsWith(n))) nums.push(faceStr);
            }
            nums.sort();
            if (!usedChoices.has(nums.join('-'))) {
                incorrectChoices.push(nums);
                usedChoices.add(nums.join('-'));
            }
            maxAttempts--;
        }
    } else {
        while (incorrectChoices.length < 3 && maxAttempts > 0) {
            let nums = [];
            while (nums.length < 3) {
                let n = Math.floor(Math.random() * 6) + 1;
                if (!nums.includes(n)) nums.push(n);
            }
            nums.sort((a, b) => a - b);
            if (!usedChoices.has(nums.join('-'))) {
                incorrectChoices.push(nums);
                usedChoices.add(nums.join('-'));
            }
            maxAttempts--;
        }
    }

    let choices = [...incorrectChoices, correctChoice];
    shuffleArray(choices);
    let questionData = {
        pattern: qTemplate.pattern,
        choices,
        correctChoice: correctChoice,
        symbolMapping: symbolMapping,
        type: type
    };
    if (qTemplate.foldedbox) {
        questionData.foldedbox = qTemplate.foldedbox;
    }

    return questionData;
}

// ==========================================
// 3. API ENDPOINT
// ==========================================
exports.getFoldingBoxQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const difficulty = req.query.difficulty || 'normal';
        const TOTAL_QUESTIONS = 35;
        let questions = [];

        const oldQuestionsCount = (difficulty === 'easy') ? TOTAL_QUESTIONS :
            (difficulty === 'hard' || difficulty === 'hell') ? 0 : 15;


        const rotatedQuestionsCount = TOTAL_QUESTIONS - oldQuestionsCount;

        for (let i = 0; i < oldQuestionsCount; i++) {
            questions.push(generateQuestionData('old', difficulty));
        }

        for (let i = 0; i < rotatedQuestionsCount; i++) {
            questions.push(generateQuestionData('rotated', difficulty));
        }

        shuffleArray(questions);


        res.json({ success: true, data: questions });
    });
});

exports.saveFoldingBoxScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            // 1. รับข้อมูลจาก Frontend
            const scoreData = req.body;
            const userEmail = scoreData.userEmail;

            if (!userEmail) {

                throw new Error("User email is missing from request body.");
            }

            // 2. ตั้งค่าตัวแปร (เหมือนใน gs.txt)
            const difficulty = scoreData.difficulty || 'normal'; // ใช้ 'normal' ตามที่คุณแก้
            const setId = `FOLDING_BOX_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);


            // 3. คำนวณ Performance Score (เหมือนใน gs.txt)
            const correctCount = scoreData.correctCount;
            const totalQuestions = scoreData.totalQuestions;
            const attemptedCount = scoreData.answeredCount;
            const performanceScore = (attemptedCount > 0 && totalQuestions > 0)
                ?
                (correctCount / totalQuestions) * (correctCount / attemptedCount) * 100
                : 0;

            const details = JSON.stringify({
                answeredCount: scoreData.answeredCount,
                accuracy: scoreData.accuracy,
                timeUsed: scoreData.timeUsed,

                difficulty: difficulty
            });

            // 4. จำลองตรรกะ saveResult (ค้นหา, ลบ, บันทึก)
            const resultsRef = db.collection("Results");
            // ชื่อ Collection ใน Firestore
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId);
            const querySnapshot = await query.get();

            let currentBestScore = -1;
            let docsToDelete = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.PerformanceScore > currentBestScore) {
                    currentBestScore = data.PerformanceScore;
                }
                docsToDelete.push(doc.ref);

            });

            // 5. เปรียบเทียบคะแนน
            if (performanceScore > currentBestScore) {

                // ถ้าคะแนนใหม่ดีกว่า: ลบของเก่าทั้งหมด
                const batch = db.batch();
                docsToDelete.forEach(docRef => {
                    batch.delete(docRef);
                });
                await batch.commit();

                // และเพิ่มของใหม่
                const newResultDoc = {
                    Timestamp: new Date(),
                    UserEmail: userEmail,

                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correctCount,
                    TotalQuestions: totalQuestions,
                    Accuracy: scoreData.accuracy,

                    TimeUsed: scoreData.timeUsed,
                    Answers: JSON.stringify(scoreData.userAnswers), // เราจะส่ง userAnswers มาจาก frontend
                    PerformanceScore: performanceScore
                };
                await resultsRef.add(newResultDoc);
            }

            // 6. คำนวณ Percentile (เหมือนใน gs.txt)
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            if (allScoresSnapshot.empty) {
                res.json({ success: true, percentile: 100 });
                return;
            }

            const allScoresForSet = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const scoresLowerOrEqual = allScoresForSet.filter(score => score <= performanceScore).length;
            const percentile = (scoresLowerOrEqual / allScoresForSet.length) * 100;

            res.json({ success: true, percentile: Math.round(percentile) });
        } catch (e) {
            console.error("Error in saveFoldingBoxScore: ", e);
            res.status(500).json({ success: false, message: e.message, percentile: -1 });
        }
    });
});
exports.getBestFoldingBoxScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            // 1. รับค่าจาก query string
            const userEmail = req.query.email;
            const difficulty = req.query.difficulty || 'normal';

            if (!userEmail) {

                throw new Error("User email is missing from query string.");
            }

            const setId = `FOLDING_BOX_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            // 2. ค้นหาคะแนนที่ดีที่สุด (gs.txt line 901-914)
            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail",
                "==", normalizedUserEmail)
                .where("SetID", "==", setId)
                .orderBy("PerformanceScore", "desc")
                .limit(1);

            const querySnapshot = await query.get();

            if (querySnapshot.empty) {
                res.json({
                    success:
                        true, data: null
                }); // ส่ง null ถ้าไม่เคยทำ
                return;
            }

            const bestRow = querySnapshot.docs[0].data();
            // 3. คำนวณ Percentile ของคะแนนที่ดีที่สุด (gs.txt line 894-900)
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allScoresForSet = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const scoresLowerOrEqual = allScoresForSet.filter(score => score <= bestRow.PerformanceScore).length;
            const bestPercentile = (scoresLowerOrEqual / allScoresForSet.length) * 100;

            // 4. ส่งข้อมูลกลับ (gs.txt line 911)
            const bestScoreData = {
                bestScore: bestRow.CorrectCount,
                totalQuestions: bestRow.TotalQuestions,
                bestAccuracy: bestRow.Accuracy,
                bestPercentile: Math.round(bestPercentile)

            };

            res.json({ success: true, data: bestScoreData });
        } catch (e) {
            console.error("Error in getBestFoldingBoxScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

exports.getTutorialData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const tutorialData = {
            symbolMapping: { '1': '●', '2': '○', '3': '■', '4': '□', '5': '◆', '6': '◇' },
            pattern: { pattern: [[null, '1', null, null], ['2', '3', '4', null], [null, '5', null, null], [null, '6', null, null]] },
            cube: [3, 2, 1]
        };
        res.json({ success: true, data: tutorialData });
    });
});

// ==========================================
// Helper Function: Normalize Email (Copy Logic มาจาก GAS 100%)
// ==========================================
const normalizeGmail = (email) => {
    if (!email || typeof email !== "string") return "";

    // 1. แปลงเป็นตัวเล็กและตัดช่องว่าง
    const cleanEmail = email.toLowerCase().trim();
    const parts = cleanEmail.split("@");

    // 2. เช็คว่าเป็น Gmail หรือไม่
    if (parts.length === 2 && parts[1] === "gmail.com") {
        // ถ้าเป็น Gmail ให้ตัดจุด (.) ออกจากชื่อข้างหน้า
        // เช่น kritsada.wong... -> kritsadawong...@gmail.com
        return parts[0].replace(/\./g, "") + "@gmail.com";
    }

    // ถ้าไม่ใช่ Gmail หรือรูปแบบผิด ให้ส่งค่าเดิมที่ตัดช่องว่างแล้วกลับไป
    return cleanEmail;
};

// ==========================================
// 4. API ENDPOINT (ตรวจสอบสิทธิ์) - PRODUCTION VERSION
// ==========================================
exports.checkUserAccess = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const rawEmail = req.body.email;
            const courseId = req.body.courseId;
            const targetEmail = normalizeGmail(rawEmail);

            // 1. เช็ค Input
            if (!targetEmail || !courseId) {
                res.status(400).json({ hasAccess: false, reason: 'Missing parameters.' });
                return;
            }

            // 2. ดึงข้อมูล User (โดยตรง ไม่ต้อง List ทั้ง DB มาดูแล้ว)
            const userRef = db.collection('users').doc(targetEmail);
            const doc = await userRef.get();

            // 3. ถ้าไม่เจอ User
            if (!doc.exists) {
                console.log(`Access Denied: User not found [${targetEmail}]`);
                res.json({ hasAccess: false, reason: 'User not found in database.' });
                return;
            }

            const userData = doc.data();

            // 4. เช็ค Status และ Expiration
            const now = new Date();
            if (userData.status !== 'Active') {
                res.json({ hasAccess: false, reason: 'Account is not active.' });
                return;
            }
            if (userData.expirationDate && userData.expirationDate.toDate() < now) {
                res.json({ hasAccess: false, reason: 'Account has expired.' });
                return;
            }

            // 5. เช็คสิทธิ์รายวิชา
            if (!userData.courseAccess || userData.courseAccess[courseId] !== true) {
                res.json({ hasAccess: false, reason: 'No access to this course.' });
                return;
            }

            // 6. ผ่านฉลุย
            console.log(`Access Granted: ${targetEmail}`);
            res.json({ hasAccess: true });

        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ hasAccess: false, reason: "Internal Server Error" });
        }
    });
});

// ==========================================
// 5. API สำหรับรับค่าจากระบบจ่ายเงิน (Webhook)
// ==========================================
exports.addStudentAfterPayment = functions.https.onRequest(async (req, res) => {
    // เปิด CORS ให้เรียกข้ามโดเมนได้
    cors(req, res, async () => {
        try {
            const paymentData = req.body;
            const rawEmail = paymentData.email;
            const courseId = paymentData.courseId;

            if (!rawEmail || !courseId) {
                res.status(400).send("Missing email or courseId");
                return;
            }

            // Normalize ก่อนบันทึก
            const userEmailKey = normalizeGmail(rawEmail);

            console.log(`Processing Payment for: ${rawEmail} -> Key: ${userEmailKey}`);

            const userRef = db.collection('users').doc(userEmailKey);

            await userRef.set({
                email: userEmailKey,
                originalEmail: rawEmail,
                role: 'Student',
                status: 'Active',
                courseAccess: {
                    [courseId]: true
                },
                updatedAt: new Date()
            }, { merge: true });

            console.log("Auto-enrollment success!");
            res.json({ success: true, message: "Student enrolled successfully" });

        } catch (error) {
            console.error("Error enrolling student:", error);
            res.status(500).send("Internal Server Error");
        }
    });
});

// ==========================================
// 7. SCS 2024 LOGIC (ย้ายมาจาก PyScript -> Node.js)
// ==========================================

exports.getSCS2024QuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        try {
            const difficulty = req.query.difficulty || 'normal';
            const ALL_SHAPE_TYPES = ['triangle', 'square', 'circle', 'pentagon', 'hexagon'];
            const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

            // 1. กำหนดจำนวนรูปทรงตามความยาก
            const numShapesMap = { 'easy': 2, 'normal': 3, 'hard': 4 };
            const numShapes = numShapesMap[difficulty] || 3;

            // 2. สุ่มเลือกรูปทรงที่จะใช้ในรอบนี้
            let availableShapes = [...ALL_SHAPE_TYPES];
            const selectedShapeTypes = [];
            for (let i = 0; i < numShapes; i++) {
                const randIndex = Math.floor(Math.random() * availableShapes.length);
                selectedShapeTypes.push(availableShapes.splice(randIndex, 1)[0]);
            }

            // 3. สร้าง Master Data (เฉลย) สำหรับแต่ละรูปทรง (เลข 1-40 คู่กับตัวอักษรอะไร)
            const masterData = {};

            selectedShapeTypes.forEach(shapeType => {
                const numbers = Array.from({ length: 40 }, (_, i) => i + 1); // [1..40]
                // Shuffle numbers
                for (let i = numbers.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
                }

                const letters = [];
                while (letters.length < 40) {
                    letters.push(...ALPHABET);
                }
                const finalLetters = letters.slice(0, 40);
                for (let i = finalLetters.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [finalLetters[i], finalLetters[j]] = [finalLetters[j], finalLetters[i]];
                }

                masterData[shapeType] = {};
                numbers.forEach((num, index) => {
                    masterData[shapeType][num] = finalLetters[index];
                });
            });

            // 4. สร้างโจทย์ 40 ข้อ (Questions)
            const questions = [];
            const numbersPool = Array.from({ length: 40 }, (_, i) => i + 1);

            // Shuffle order of questions
            for (let i = numbersPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbersPool[i], numbersPool[j]] = [numbersPool[j], numbersPool[i]];
            }

            numbersPool.forEach(num => {
                const shape = selectedShapeTypes[Math.floor(Math.random() * selectedShapeTypes.length)];
                const correctAnswer = masterData[shape][num];

                // สร้างตัวเลือกหลอก (Distractors)
                const optionsSet = new Set([correctAnswer]);
                while (optionsSet.size < 4) {
                    const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
                    optionsSet.add(randomLetter);
                }
                const shuffledOptions = Array.from(optionsSet);

                // Shuffle Options
                for (let i = shuffledOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                }

                questions.push({
                    number: num,
                    shape: shape,
                    correctAnswer: correctAnswer,
                    options: shuffledOptions
                });
            });

            // 5. เพิ่มฟังก์ชัน saveSCS2024Score และ getBestSCS2024Score แบบเดียวกับ FoldingBox
            // (แต่ใช้ชื่อ Collection ใหม่ให้เหมาะกับเกมนี้)

            res.json({
                success: true,
                data: {
                    difficulty: difficulty,
                    shapeTypes: selectedShapeTypes,
                    masterData: masterData,
                    questions: questions
                }
            });

        } catch (e) {
            console.error("Error in getSCS2024QuizData:", e);
            res.status(500).json({ success: false, error: e.message });
        }
    });
});

// ฟังก์ชัน Save Score สำหรับ SCS 2024
exports.saveSCS2024Score = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const scoreData = req.body;
            const userEmail = scoreData.userEmail;
            if (!userEmail) throw new Error("User email missing.");

            const difficulty = scoreData.difficulty || 'normal';
            const setId = `SCS_2024_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            // คำนวณ Performance Score (สูตรเดียวกับ FoldingBox)
            // (Attempted > 0 ? (Correct/Total) * (Correct/Attempted) * 100 : 0)
            const correct = scoreData.score;
            const total = 40;
            const attempted = scoreData.questionsAnswered;

            const performanceScore = (attempted > 0)
                ? (correct / total) * (correct / attempted) * 100
                : 0;

            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId);
            const querySnapshot = await query.get();

            let currentBestScore = -1;
            let docsToDelete = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.PerformanceScore > currentBestScore) currentBestScore = data.PerformanceScore;
                docsToDelete.push(doc.ref);
            });

            if (performanceScore > currentBestScore) {
                const batch = db.batch();
                docsToDelete.forEach(docRef => batch.delete(docRef));
                await batch.commit();

                const newResultDoc = {
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correct,
                    TotalQuestions: total,
                    Accuracy: scoreData.accuracy,
                    TimeUsed: scoreData.timeUsed,
                    Answers: JSON.stringify({ isFail: scoreData.isFail }), // เก็บข้อมูลเสริม
                    PerformanceScore: performanceScore
                };
                await resultsRef.add(newResultDoc);
            }

            // Calculate Percentile
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            if (allScoresSnapshot.empty) {
                res.json({ success: true, percentile: 100 });
                return;
            }
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= performanceScore).length;
            const percentile = (lower / allScores.length) * 100;

            res.json({ success: true, percentile: Math.round(percentile) });

        } catch (e) {
            console.error("Error saveSCS2024Score:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// ฟังก์ชัน Get Best Score สำหรับ SCS 2024
exports.getBestSCS2024Score = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userEmail = req.query.email;
            const difficulty = req.query.difficulty || 'normal';
            const setId = `SCS_2024_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId)
                .orderBy("PerformanceScore", "desc")
                .limit(1);

            const querySnapshot = await query.get();

            if (querySnapshot.empty) {
                res.json({ success: true, data: null });
                return;
            }

            const bestRow = querySnapshot.docs[0].data();

            // คำนวณ Percentile ของ Best Score
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= bestRow.PerformanceScore).length;
            const bestPercentile = (lower / allScores.length) * 100;

            const bestScoreData = {
                bestScore: bestRow.CorrectCount,
                totalQuestions: bestRow.TotalQuestions,
                bestAccuracy: bestRow.Accuracy,
                bestPercentile: Math.round(bestPercentile)
            };
            res.json({ success: true, data: bestScoreData });

        } catch (e) {
            console.error("Error getBestSCS2024Score:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// ==========================================
// 8. SCS ORIGINAL LOGIC (One Big Window)
// ==========================================

exports.getSCSQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        try {
            const difficulty = req.query.difficulty || 'normal';
            const ALL_SHAPE_TYPES = ['triangle', 'square', 'circle', 'pentagon', 'hexagon'];
            const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

            // 1. กำหนดจำนวนรูปทรงตามความยาก
            // Easy: 2 shapes, normal: 3 shapes, Hard: 4 shapes
            const numShapesMap = { 'easy': 2, 'normal': 3, 'hard': 4 };
            const numShapes = numShapesMap[difficulty] || 3;

            // 2. สุ่มเลือกรูปทรงที่จะใช้
            let availableShapes = [...ALL_SHAPE_TYPES];
            const selectedShapeTypes = [];
            for (let i = 0; i < numShapes; i++) {
                const randIndex = Math.floor(Math.random() * availableShapes.length);
                selectedShapeTypes.push(availableShapes.splice(randIndex, 1)[0]);
            }

            // 3. สร้าง Master Data (เฉลย)
            // สำหรับแต่ละรูปทรง จะมีเลข 1-40 และคู่กับตัวอักษรที่ไม่ซ้ำกันในชุดนั้นๆ
            const masterData = {};

            selectedShapeTypes.forEach(shapeType => {
                const numbers = Array.from({ length: 40 }, (_, i) => i + 1);
                // Shuffle numbers
                for (let i = numbers.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
                }

                // สร้าง Pool ตัวอักษร (A-Z) ให้พอสำหรับ 40 เลข
                const letters = [];
                while (letters.length < 40) {
                    letters.push(...ALPHABET);
                }
                // ตัดให้เหลือ 40 และ Shuffle
                const finalLetters = letters.slice(0, 40);
                for (let i = finalLetters.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [finalLetters[i], finalLetters[j]] = [finalLetters[j], finalLetters[i]];
                }

                masterData[shapeType] = {};
                numbers.forEach((num, index) => {
                    masterData[shapeType][num] = finalLetters[index];
                });
            });

            // 4. สร้างโจทย์ 40 ข้อ (Questions)
            const questions = [];
            const numbersPool = Array.from({ length: 40 }, (_, i) => i + 1);

            // Shuffle ลำดับข้อสอบ
            for (let i = numbersPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbersPool[i], numbersPool[j]] = [numbersPool[j], numbersPool[i]];
            }

            numbersPool.forEach(num => {
                const shape = selectedShapeTypes[Math.floor(Math.random() * selectedShapeTypes.length)];
                const correctAnswer = masterData[shape][num];

                // สร้างตัวเลือกหลอก (Distractors)
                const optionsSet = new Set([correctAnswer]);
                while (optionsSet.size < 4) {
                    const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
                    optionsSet.add(randomLetter);
                }
                const shuffledOptions = Array.from(optionsSet);

                // Shuffle Options
                for (let i = shuffledOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                }

                questions.push({
                    number: num,
                    shape: shape,
                    correctAnswer: correctAnswer,
                    options: shuffledOptions
                });
            });

            res.json({
                success: true,
                data: {
                    difficulty: difficulty,
                    shapeTypes: selectedShapeTypes,
                    masterData: masterData,
                    questions: questions
                }
            });

        } catch (e) {
            console.error("Error in getSCSQuizData:", e);
            res.status(500).json({ success: false, error: e.message });
        }
    });
});

// ==========================================
// 9. API สำหรับ SCS Original (Save & Get Best)
// ==========================================

exports.saveSCSScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const scoreData = req.body;
            const userEmail = scoreData.userEmail;
            if (!userEmail) throw new Error("User email missing.");

            const difficulty = scoreData.difficulty || 'normal';
            // ตั้งชื่อ SetID ให้ต่างจาก SCS 2024
            const setId = `SCS_ORIGINAL_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            const correct = scoreData.score;
            const total = 40;
            const attempted = scoreData.questionsAnswered;

            // สูตรคำนวณ Performance Score
            const performanceScore = (attempted > 0)
                ? (correct / total) * (correct / attempted) * 100
                : 0;

            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId);
            const querySnapshot = await query.get();

            let currentBestScore = -1;
            let docsToDelete = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.PerformanceScore > currentBestScore) currentBestScore = data.PerformanceScore;
                docsToDelete.push(doc.ref);
            });

            if (performanceScore > currentBestScore) {
                const batch = db.batch();
                docsToDelete.forEach(docRef => batch.delete(docRef));
                await batch.commit();

                const newResultDoc = {
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correct,
                    TotalQuestions: total,
                    Accuracy: scoreData.accuracy,
                    TimeUsed: scoreData.timeUsed,
                    PerformanceScore: performanceScore
                };
                await resultsRef.add(newResultDoc);
            }

            // Calculate Percentile
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            if (allScoresSnapshot.empty) {
                res.json({ success: true, percentile: 100 });
                return;
            }
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= performanceScore).length;
            const percentile = (lower / allScores.length) * 100;
            res.json({ success: true, percentile: Math.round(percentile) });

        } catch (e) {
            console.error("Error saveSCSScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

exports.getBestSCSScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userEmail = req.query.email;
            const difficulty = req.query.difficulty || 'normal';
            const setId = `SCS_ORIGINAL_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId)
                .orderBy("PerformanceScore", "desc")
                .limit(1);

            const querySnapshot = await query.get();

            if (querySnapshot.empty) {
                res.json({ success: true, data: null });
                return;
            }

            const bestRow = querySnapshot.docs[0].data();

            // Calculate Percentile of Best Score
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= bestRow.PerformanceScore).length;
            const bestPercentile = (lower / allScores.length) * 100;

            const bestScoreData = {
                bestScore: bestRow.CorrectCount,
                totalQuestions: bestRow.TotalQuestions,
                bestAccuracy: bestRow.Accuracy,
                bestPercentile: Math.round(bestPercentile)
            };
            res.json({ success: true, data: bestScoreData });

        } catch (e) {
            console.error("Error getBestSCSScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// ==========================================
// 10. SCN (Scanning Number) LOGIC
// ==========================================

// Helper สำหรับ Shuffle Array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

exports.getSCNQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        try {
            const difficulty = req.query.difficulty || 'normal';
            const size = 100; // 100 ช่อง

            // 1. สร้างคู่ตัวเลข 1-100
            let questionNumbers = Array.from({ length: size }, (_, i) => i + 1);
            let answerNumbers = Array.from({ length: size }, (_, i) => i + 1);

            // Shuffle เพื่อให้ตำแหน่งในตารางไม่เรียงกัน
            shuffleArray(questionNumbers);
            shuffleArray(answerNumbers);

            // สร้าง Map คำตอบที่ถูกต้อง (Question Num -> Answer Num)
            const answerMap = {};
            for (let i = 0; i < size; i++) {
                answerMap[questionNumbers[i]] = answerNumbers[i];
            }

            // 2. สร้างคำถาม 100 ข้อ
            const questions = [];
            for (let i = 1; i <= size; i++) {
                const qNum = i;
                const correctAns = answerMap[qNum]; // ตัวเลขคำตอบที่ถูกต้อง

                // สร้างตัวลวง (Distractors)
                // เอาเลขทั้งหมดมาลบตัวถูกออก แล้วสุ่มมา 3 ตัว
                let distractors = answerNumbers.filter(n => n !== correctAns);
                shuffleArray(distractors);

                // รวมตัวถูกและตัวลวง
                let optionsArr = [correctAns, distractors[0], distractors[1], distractors[2]];
                shuffleArray(optionsArr);

                // Map เข้า A, B, C, D
                const optionsObj = {
                    'A': optionsArr[0],
                    'B': optionsArr[1],
                    'C': optionsArr[2],
                    'D': optionsArr[3]
                };

                // หาว่าข้อถูกคือ Choice ไหน
                const correctChoiceKey = Object.keys(optionsObj).find(key => optionsObj[key] === correctAns);

                questions.push({
                    id: qNum,
                    text: `Find the main number for question #${qNum}`,
                    options: optionsObj,
                    correctAnswer: correctChoiceKey // ส่งเฉลยไปให้ Frontend (เพื่อความง่ายในการตรวจ)
                });
            }

            // Logic ตาม SCN.gs: Hard Mode สุ่มลำดับข้อ
            if (difficulty === 'hard') {
                shuffleArray(questions);
            } else {
                questions.sort((a, b) => a.id - b.id);
            }

            res.json({
                success: true,
                data: {
                    quizInfo: { timeLimit: 180, totalQuestions: 100 }, // 3 นาที
                    gridData: { questionNumbers, answerNumbers },
                    questions: questions
                }
            });

        } catch (e) {
            console.error("Error getSCNQuizData:", e);
            res.status(500).json({ success: false, error: e.message });
        }
    });
});

exports.saveSCNScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const scoreData = req.body;
            const userEmail = scoreData.userEmail;
            if (!userEmail) throw new Error("User email missing.");

            const difficulty = scoreData.difficulty || 'normal';
            const setId = `SCN_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            // คำนวณ Performance Score
            const correct = scoreData.correctCount;
            const total = scoreData.totalQuestions || 100;
            const attempted = scoreData.totalAnswered;

            // ถ้า Fail (ข้ามข้อ) คะแนนเป็น 0
            const isFail = scoreData.isFail || false;
            const performanceScore = (!isFail && attempted > 0)
                ? (correct / total) * (correct / attempted) * 100
                : 0;

            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId);
            const querySnapshot = await query.get();

            let currentBestScore = -1;
            let docsToDelete = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.PerformanceScore > currentBestScore) currentBestScore = data.PerformanceScore;
                docsToDelete.push(doc.ref);
            });

            // บันทึกถ้าคะแนนดีกว่าเดิม
            if (performanceScore > currentBestScore) {
                const batch = db.batch();
                docsToDelete.forEach(docRef => batch.delete(docRef));
                await batch.commit();

                const newResultDoc = {
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correct,
                    TotalQuestions: total,
                    Accuracy: scoreData.accuracy,
                    TimeUsed: scoreData.timeUsed,
                    IsFail: isFail,
                    PerformanceScore: performanceScore
                };
                await resultsRef.add(newResultDoc);
            }

            // Calculate Percentile
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            if (allScoresSnapshot.empty) {
                res.json({ success: true, percentile: 100 });
                return;
            }
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= performanceScore).length;
            const percentile = (lower / allScores.length) * 100;

            res.json({ success: true, percentile: Math.round(percentile) });

        } catch (e) {
            console.error("Error saveSCNScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

exports.getBestSCNScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userEmail = req.query.email;
            const difficulty = req.query.difficulty || 'normal';
            const setId = `SCN_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId)
                .orderBy("PerformanceScore", "desc")
                .limit(1);

            const querySnapshot = await query.get();

            if (querySnapshot.empty) {
                res.json({ success: true, data: null });
                return;
            }

            const bestRow = querySnapshot.docs[0].data();

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= bestRow.PerformanceScore).length;
            const bestPercentile = (lower / allScores.length) * 100;

            const bestScoreData = {
                bestScore: bestRow.CorrectCount,
                totalQuestions: bestRow.TotalQuestions,
                bestAccuracy: bestRow.Accuracy,
                bestPercentile: Math.round(bestPercentile)
            };
            res.json({ success: true, data: bestScoreData });

        } catch (e) {
            console.error("Error getBestSCNScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// ==========================================
// 11. RUBIK 3D LOGIC (MIGRATED FROM GAS)
// ==========================================

// --- Constants & Helper Functions for Rubik ---
const CUBE_SIZE = 3;
const TOTAL_CELLS = CUBE_SIZE * CUBE_SIZE * CUBE_SIZE;

// สร้าง Cube 3x3x3 ที่สมบูรณ์ (Solved State)
const SOLVED_CUBE_CONFIG = (() => {
    const cubies = [];
    for (let z = -1; z <= 1; z++) {
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                cubies.push({
                    id: `c_${x + 1}_${y + 1}_${z + 1}`,
                    pos: { x, y, z },
                    color: 'base'
                });
            }
        }
    }
    return cubies;
})();

function shuffleRubikArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function isRubikChoiceDuplicate(newChoice, existingChoices) {
    if (!newChoice) return true;
    // สร้าง Signature ของ Choice โดยการเรียง ID ของ Cubie
    const newChoiceSig = JSON.stringify(newChoice.map(c => ({ id: c.id, color: c.color })).sort((a, b) => a.id.localeCompare(b.id)));
    for (const choice of existingChoices) {
        const existingChoiceSig = JSON.stringify(choice.map(c => ({ id: c.id, color: c.color })).sort((a, b) => a.id.localeCompare(b.id)));
        if (newChoiceSig === existingChoiceSig) return true;
    }
    return false;
}

function createWrongShapeChoice(correctChoice, remainingCubies, existingChoices) {
    let attempts = 0;
    while (attempts < 20) {
        attempts++;
        let wrong = JSON.parse(JSON.stringify(correctChoice));
        if (wrong.length > 0 && remainingCubies.length > 0) {
            // ลบ 1 ชิ้น และเพิ่ม 1 ชิ้นจากกองกลาง (เปลี่ยนรูปร่าง)
            wrong.splice(Math.floor(Math.random() * wrong.length), 1);
            wrong.push(remainingCubies[Math.floor(Math.random() * remainingCubies.length)]);

            if (!isRubikChoiceDuplicate(wrong, existingChoices)) return wrong;
        }
    }
    return null;
}

function createWrongColorChoice(correctChoice, existingChoices) {
    let attempts = 0;
    while (attempts < 20) {
        attempts++;
        let wrong = JSON.parse(JSON.stringify(correctChoice));
        const baseCubies = wrong.filter(c => c.color === 'base');
        const accentCubies = wrong.filter(c => c.color !== 'base');

        // สลับสีระหว่าง Base กับ Accent
        if (accentCubies.length > 0 && baseCubies.length > 0) {
            const accentCubie = accentCubies[Math.floor(Math.random() * accentCubies.length)];
            const baseCubie = baseCubies[Math.floor(Math.random() * baseCubies.length)];

            const tempColor = accentCubie.color;
            wrong.find(c => c.id === accentCubie.id).color = 'base';
            wrong.find(c => c.id === baseCubie.id).color = tempColor;

            if (!isRubikChoiceDuplicate(wrong, existingChoices)) return wrong;
        } else {
            return null; // ทำไม่ได้ถ้าไม่มีสี Accent
        }
    }
    return null;
}

function generateRubikQuestion(numPieces) {
    // 1. Prepare Master Cube & Visible Cubies
    let masterCube = JSON.parse(JSON.stringify(SOLVED_CUBE_CONFIG));
    // เลือก Cubie ที่อยู่ด้านหน้า/ขวา/บน เพื่อทาสี
    const visibleCubies = masterCube.filter(c => c.pos.x === 1 || c.pos.y === -1 || c.pos.z === 1);
    shuffleRubikArray(visibleCubies);

    // 2. Paint Accent Colors
    const accentCubieCount = Math.floor(Math.random() * 4) + 3; // 3 to 6
    const accentColors = ['accent1', 'accent2'];
    for (let i = 0; i < accentCubieCount; i++) {
        if (visibleCubies[i]) {
            const cubieToColor = masterCube.find(c => c.id === visibleCubies[i].id);
            cubieToColor.color = accentColors[Math.floor(Math.random() * accentColors.length)];
        }
    }

    const finalMasterCube = JSON.parse(JSON.stringify(masterCube)); // เก็บเฉลยรูปเต็ม
    shuffleRubikArray(masterCube); // สลับลำดับเพื่อสุ่มหยิบ

    // 3. Split into Pieces
    let pieceSizes = [];
    let remainingCount = TOTAL_CELLS;
    for (let i = 0; i < numPieces - 1; i++) {
        const minSize = 5;
        // คำนวณขนาดที่เหลือเพื่อให้พอดีกับจำนวนชิ้น
        const maxSize = Math.max(minSize, Math.floor(remainingCount - (minSize * (numPieces - 1 - i))));
        const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        pieceSizes.push(size);
        remainingCount -= size;
    }
    pieceSizes.push(remainingCount);

    let pieces = [];
    pieceSizes.forEach(size => {
        pieces.push(masterCube.splice(0, size));
    });

    const correctAnswer = pieces.pop(); // ชิ้นสุดท้ายคือคำตอบที่หายไป
    const puzzlePieces = pieces; // ชิ้นที่เหลือคือโจทย์

    // 4. Generate Choices (1 Correct + 3 Wrong)
    const choices = [];
    // เราจะเก็บ Correct ไว้ก่อน แล้วค่อย Shuffle ทีหลัง
    // แต่เพื่อให้ตรวจคำตอบได้ เราต้องรู้ว่า index ไหนถูก

    const wrongChoices = [];
    let attempts = 0;
    while (wrongChoices.length < 3 && attempts < 100) {
        attempts++;
        let newChoice = null;
        const strategy = Math.random();
        const allExisting = wrongChoices.concat([correctAnswer]);

        if (strategy < 0.6) {
            newChoice = createWrongColorChoice(correctAnswer, allExisting);
        } else {
            newChoice = createWrongShapeChoice(correctAnswer, masterCube, allExisting); // Note: masterCube here acts as remaining pool, vaguely correct based on logic
        }

        // Fallback Logic from GAS if specific strategies fail
        if (!newChoice) {
            let wrong = JSON.parse(JSON.stringify(correctAnswer));
            // Simple mutation logic (shuffle or swap a block from outside)
            // Simulating pool logic from GAS roughly
            newChoice = wrong; // Placeholder if complex logic fails, but createWrongShape usually works
        }

        if (newChoice && !isRubikChoiceDuplicate(newChoice, allExisting)) {
            wrongChoices.push(newChoice);
        }
    }

    // เผื่อสร้างไม่ครบ
    while (wrongChoices.length < 3) {
        // Create a dummy wrong choice by just recoloring random block
        let wrong = JSON.parse(JSON.stringify(correctAnswer));
        wrong[0].color = wrong[0].color === 'base' ? 'accent1' : 'base';
        wrongChoices.push(wrong);
    }

    // รวมคำตอบ
    const finalChoices = [correctAnswer, ...wrongChoices];

    // Shuffle choices และจำไว้ว่าอันไหนคือข้อถูก
    // สร้าง Object wrapper เพื่อติดตาม Index เดิม
    const labeledChoices = finalChoices.map((c, i) => ({ choice: c, isCorrect: i === 0 }));
    shuffleRubikArray(labeledChoices);

    return {
        puzzlePieces, // โจทย์ (ชิ้นส่วนที่มี)
        choices: labeledChoices.map(lc => lc.choice), // ตัวเลือก (A, B, C, D)
        correctIndex: labeledChoices.findIndex(lc => lc.isCorrect), // **Index ของข้อที่ถูก** (ส่งไปให้ Client แต่อย่าแสดงผล)
        masterCube: finalMasterCube
    };
}

// --- API: Get Rubik Quiz Data ---
exports.getRubik3DQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        try {
            const difficulty = req.query.difficulty || 'normal';
            const TOTAL_QUESTIONS = 15;
            let questions = [];

            // Logic Difficulty (เหมือน GAS)
            if (difficulty === 'easy') {
                for (let i = 0; i < TOTAL_QUESTIONS; i++) questions.push(generateRubikQuestion(2));
            } else if (difficulty === 'normal') {
                for (let i = 0; i < 8; i++) questions.push(generateRubikQuestion(2));
                for (let i = 0; i < 7; i++) questions.push(generateRubikQuestion(3));
            } else { // Hard
                for (let i = 0; i < TOTAL_QUESTIONS; i++) questions.push(generateRubikQuestion(3));
            }

            shuffleRubikArray(questions);

            // ส่งข้อมูลกลับ Client
            // หมายเหตุ: เราส่ง correctIndex ไปด้วย เพื่อให้ Frontend ใช้ในการส่งกลับมาตรวจสอบ (Stateless Validation)
            // หรือใช้ใน Practice Mode เพื่อเฉลย
            res.json({ success: true, data: questions });

        } catch (e) {
            console.error("Error getRubik3DQuizData:", e);
            res.status(500).json({ success: false, error: e.message });
        }
    });
});

// --- API: Save Score (Secure Calculation) ---
exports.saveRubik3DScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const scoreData = req.body;
            const userEmail = scoreData.userEmail;
            if (!userEmail) throw new Error("User email missing.");

            const difficulty = scoreData.difficulty || 'normal';
            const setId = `RUBIK_3D_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            // --- SECURE SCORING LOGIC ---
            // รับ userAnswers (Array of Selected Indices) และ correctIndices (Array of Correct Indices)
            // Frontend ต้องส่งทั้งคู่มา (เนื่องจาก Backend เป็น Stateless ไม่ได้เก็บโจทย์ไว้)
            // ถึงแม้ User จะแก้ correctIndices ได้ แต่ก็ต้องรู้ structure ซึ่งยากกว่าการแก้ score โดยตรง

            const userAnswers = scoreData.userAnswers || [];
            const correctIndices = scoreData.correctIndices || []; // รับเฉลยที่ Frontend ได้รับตอนโหลดโจทย์

            let calculatedCorrectCount = 0;
            let answeredCount = 0;

            userAnswers.forEach((ans, index) => {
                if (ans !== null && ans !== undefined) {
                    answeredCount++;
                    // ตรวจคำตอบที่ Server
                    if (ans === correctIndices[index]) {
                        calculatedCorrectCount++;
                    }
                }
            });

            // คำนวณ Performance Score
            const totalQuestions = scoreData.totalQuestions || 15;
            const performanceScore = (answeredCount > 0)
                ? (calculatedCorrectCount / totalQuestions) * (calculatedCorrectCount / answeredCount) * 100
                : 0;

            // Database Operations (เหมือน FoldingBox)
            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId);
            const querySnapshot = await query.get();

            let currentBestScore = -1;
            let docsToDelete = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.PerformanceScore > currentBestScore) currentBestScore = data.PerformanceScore;
                docsToDelete.push(doc.ref);
            });

            if (performanceScore > currentBestScore) {
                const batch = db.batch();
                docsToDelete.forEach(docRef => batch.delete(docRef));
                await batch.commit();

                const newResultDoc = {
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: calculatedCorrectCount, // ใช้ค่าที่คำนวณใหม่
                    TotalQuestions: totalQuestions,
                    Accuracy: (answeredCount > 0 ? (calculatedCorrectCount / answeredCount) * 100 : 0),
                    TimeUsed: scoreData.timeUsed,
                    PerformanceScore: performanceScore,
                    Difficulty: difficulty
                };
                await resultsRef.add(newResultDoc);
            }

            // Calculate Percentile
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            if (allScoresSnapshot.empty) {
                res.json({ success: true, percentile: 100 });
                return;
            }
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= performanceScore).length;
            const percentile = (lower / allScores.length) * 100;

            res.json({ success: true, percentile: Math.round(percentile) });

        } catch (e) {
            console.error("Error saveRubik3DScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// --- API: Get Best Score ---
exports.getBestRubik3DScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userEmail = req.query.email;
            const difficulty = req.query.difficulty || 'normal';
            const setId = `RUBIK_3D_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId)
                .orderBy("PerformanceScore", "desc")
                .limit(1);

            const querySnapshot = await query.get();

            if (querySnapshot.empty) {
                res.json({ success: true, data: null });
                return;
            }

            const bestRow = querySnapshot.docs[0].data();

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= bestRow.PerformanceScore).length;
            const bestPercentile = (lower / allScores.length) * 100;

            const bestScoreData = {
                bestScore: bestRow.CorrectCount,
                totalQuestions: bestRow.TotalQuestions,
                bestAccuracy: bestRow.Accuracy,
                bestPercentile: Math.round(bestPercentile)
            };
            res.json({ success: true, data: bestScoreData });

        } catch (e) {
            console.error("Error getBestRubik3DScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});


// ==========================================
// 8. SCT (Scanning Text) LOGIC & API
// ==========================================

const CHARS_SCT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// *** เพิ่ม Helper Function นี้ใน index.js (ถ้ายังไม่มี) ***
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateRandomString(length) {
    let result = '';
    const charactersLength = CHARS_SCT.length;
    for (let i = 0; i < length; i++) {
        result += CHARS_SCT.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Helper: สร้างโจทย์ SCT 1 ข้อ
function generateSCTQuestion(difficulty) {
    const lengths = { easy: 15, normal: 20, hard: 30, hell: 30 };
    const strLength = lengths[difficulty] || 20;

    if (difficulty === 'hell') {
        // ... (Logic Hell Mode เหมือนเดิม) ...
        const str1 = generateRandomString(strLength);
        const targetDiff = Math.floor(Math.random() * 17);

        let str2 = str1.split('');
        let str3 = str1.split('');
        let str4 = str1.split('');

        let positions = new Set();
        while (positions.size < targetDiff) {
            positions.add(Math.floor(Math.random() * strLength));
        }

        positions.forEach(pos => {
            let modified = false;
            if (Math.random() > 0.3) { str2[pos] = CHARS_SCT.charAt(Math.floor(Math.random() * CHARS_SCT.length)); modified = true; }
            if (Math.random() > 0.3) { str3[pos] = CHARS_SCT.charAt(Math.floor(Math.random() * CHARS_SCT.length)); modified = true; }
            if (Math.random() > 0.3) { str4[pos] = CHARS_SCT.charAt(Math.floor(Math.random() * CHARS_SCT.length)); modified = true; }

            if (!modified || (str1[pos] === str2[pos] && str1[pos] === str3[pos] && str1[pos] === str4[pos])) {
                let newChar;
                do { newChar = CHARS_SCT.charAt(Math.floor(Math.random() * CHARS_SCT.length)); } while (newChar === str1[pos]);
                str2[pos] = newChar;
            }
        });

        let actualDiff = 0;
        for (let j = 0; j < strLength; j++) {
            if (str1[j] !== str2[j] || str1[j] !== str3[j] || str1[j] !== str4[j]) actualDiff++;
        }

        return {
            left1: str1,
            left2: str2.join(''),
            right1: str3.join(''),
            right2: str4.join(''),
            diff: actualDiff,
            type: 'hell'
        };
    } else {
        // Standard Mode
        const left = generateRandomString(strLength);
        const diff = Math.floor(Math.random() * 6);

        let rightArr = left.split('');
        if (diff > 0) {
            let positions = new Set();
            while (positions.size < diff) positions.add(Math.floor(Math.random() * strLength));

            positions.forEach(pos => {
                let newChar;
                do {
                    newChar = CHARS_SCT.charAt(Math.floor(Math.random() * CHARS_SCT.length));
                } while (newChar === rightArr[pos]);
                rightArr[pos] = newChar;
            });
        }

        const correctAnswer = diff;
        let possibleWrongAnswers = [];
        for (let j = 0; j <= 10; j++) {
            if (j !== correctAnswer) possibleWrongAnswers.push(j);
        }

        // *** ตรงนี้คือจุดที่เคย Error ถ้าไม่มี function shuffleArray ***
        shuffleArray(possibleWrongAnswers);
        let options = [correctAnswer, ...possibleWrongAnswers.slice(0, 3)];
        shuffleArray(options);

        return {
            left: left,
            right: rightArr.join(''),
            diff: diff,
            shuffledOptions: options,
            type: 'standard'
        };
    }
}

// API: ดึงโจทย์ SCT
exports.getSCTQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const difficulty = req.query.difficulty || 'normal';
        let TOTAL_QUESTIONS = (difficulty === 'hell') ? 40 : 30; // Hell 40 ข้อ, อื่นๆ 30 ข้อ

        let questions = [];
        for (let i = 0; i < TOTAL_QUESTIONS; i++) {
            questions.push(generateSCTQuestion(difficulty));
        }

        res.json({ success: true, data: questions });
    });
});

// API: บันทึกคะแนน SCT
exports.saveSCTScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const scoreData = req.body;
            const userEmail = scoreData.userEmail;
            if (!userEmail) throw new Error("User email is missing.");

            const difficulty = scoreData.difficulty || 'normal';
            const setId = `SCT_${difficulty.toUpperCase()}`; // SetID: SCT_NORMAL, SCT_HELL etc.
            const normalizedUserEmail = normalizeGmail(userEmail);

            // คำนวณ Performance Score สูตรเดิม: (Correct/Total) * (Correct/Attempted) * 100
            const correctCount = scoreData.correctCount;
            const totalQuestions = scoreData.totalQuestions;
            const attemptedCount = scoreData.answeredCount;

            // ถ้า isFail (เช่นทำไม่ทัน หรือกดข้ามใน Test Mode) ให้ score เป็น 0 (ตาม Logic SCT เดิม)
            const performanceScore = (!scoreData.isFail && attemptedCount > 0 && totalQuestions > 0)
                ? (correctCount / totalQuestions) * (correctCount / attemptedCount) * 100
                : 0;

            const resultsRef = db.collection("Results");

            // เช็คคะแนนเก่า (Best Score Logic)
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId);
            const querySnapshot = await query.get();

            let currentBestScore = -1;
            let docsToDelete = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.PerformanceScore > currentBestScore) currentBestScore = data.PerformanceScore;
                docsToDelete.push(doc.ref);
            });

            // ถ้าคะแนนใหม่ดีกว่า ให้ลบอันเก่าแล้วบันทึกใหม่
            if (performanceScore > currentBestScore) {
                const batch = db.batch();
                docsToDelete.forEach(docRef => batch.delete(docRef));
                await batch.commit();

                const newResultDoc = {
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correctCount,
                    TotalQuestions: totalQuestions,
                    Accuracy: scoreData.accuracy,
                    TimeUsed: scoreData.timeUsed,
                    Answers: JSON.stringify(scoreData.userAnswers),
                    PerformanceScore: performanceScore,
                    Difficulty: difficulty
                };
                await resultsRef.add(newResultDoc);
            }

            // คำนวณ Percentile
            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            if (allScoresSnapshot.empty) {
                res.json({ success: true, percentile: 100 });
                return;
            }
            const allScores = allScoresSnapshot.docs.map(doc => doc.data().PerformanceScore);
            const lower = allScores.filter(s => s <= performanceScore).length;
            const percentile = (lower / allScores.length) * 100;

            res.json({ success: true, percentile: Math.round(percentile) });

        } catch (e) {
            console.error("Error saveSCTScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// API: ดึง Best Score SCT
exports.getBestSCTScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userEmail = req.query.email;
            const difficulty = req.query.difficulty || 'normal';
            if (!userEmail) throw new Error("Email missing.");

            const setId = `SCT_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            const resultsRef = db.collection("Results");
            const query = resultsRef.where("NormalizedEmail", "==", normalizedUserEmail)
                .where("SetID", "==", setId)
                .orderBy("PerformanceScore", "desc")
                .limit(1);

            const snapshot = await query.get();
            if (snapshot.empty) {
                res.json({ success: true, data: null });
                return;
            }

            const bestRow = snapshot.docs[0].data();

            // คำนวณ Percentile ของ Best Score
            const allSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allScores = allSnapshot.docs.map(d => d.data().PerformanceScore);
            const lower = allScores.filter(s => s <= bestRow.PerformanceScore).length;
            const bestPercentile = (lower / allScores.length) * 100;

            res.json({
                success: true,
                data: {
                    bestScore: bestRow.CorrectCount,
                    totalQuestions: bestRow.TotalQuestions,
                    bestAccuracy: bestRow.Accuracy,
                    bestPercentile: Math.round(bestPercentile)
                }
            });

        } catch (e) {
            console.error("Error getBestSCTScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// ==========================================
// 2. GSC Functions: Robust Save Logic
// ==========================================

exports.submitGSCScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const data = req.body;
            const uid = data.uid;
            const userEmail = data.email;

            if (!uid || !userEmail) {
                res.status(400).json({ success: false, message: 'Missing User ID or Email' });
                return;
            }

            // 1. รับค่าและคำนวณ Accuracy
            const score = Number(data.score) || 0;
            const total = Number(data.total) || 0;
            const timeSpent = Number(data.timeSpent) || 0;
            const attempted = Number(data.attempted) || 0;
            
            // Logic Accuracy: Score / Attempted
            const accuracy = attempted > 0 ? parseFloat(((score / attempted) * 100).toFixed(2)) : 0;

            let testType = "Test";
            if (data.mode && typeof data.mode === 'string' && data.mode.toLowerCase() === 'practice') {
                testType = "Practice";
            }

            const scoreData = {
                UID: uid,
                Email: userEmail,
                NormalizedEmail: normalizeGmail(userEmail),
                SetID: "GSC",
                TestType: testType,
                CorrectCount: score,
                TotalQuestions: total,
                Accuracy: accuracy,
                TimeSpent: timeSpent,
                Timestamp: FieldValue.serverTimestamp()
            };

            const resultsRef = db.collection("Results");

            // 2. จัดการ Save/Update Best Score
            const oldScoreSnapshot = await resultsRef
                .where("UID", "==", uid)
                .where("SetID", "==", "GSC")
                .where("TestType", "==", testType)
                .limit(1)
                .get();

            let bestScoreData = { ...scoreData };
            let isNewBest = false;

            if (oldScoreSnapshot.empty) {
                await resultsRef.add(scoreData);
                isNewBest = true;
            } else {
                const oldDoc = oldScoreSnapshot.docs[0];
                const oldData = oldDoc.data();
                const oldScore = Number(oldData.CorrectCount) || 0;
                const oldTime = Number(oldData.TimeSpent) || 999999;

                if (score > oldScore || (score === oldScore && timeSpent < oldTime)) {
                    await oldDoc.ref.update(scoreData);
                    isNewBest = true;
                } else {
                    bestScoreData = {
                        CorrectCount: oldScore,
                        TotalQuestions: oldData.TotalQuestions || total,
                        Accuracy: oldData.Accuracy || 0,
                        TimeSpent: oldTime
                    };
                }
            }

            // 3. คำนวณ Percentile (FIXED LOGIC)
            let currentPercentile = 0;
            let bestPercentile = 0;

            if (testType === 'Test') {
                const allScoresSnapshot = await resultsRef
                    .where("SetID", "==", "GSC")
                    .where("TestType", "==", "Test")
                    .get();

                if (!allScoresSnapshot.empty) {
                    // ดึงคะแนนทั้งหมดมาเป็น Array
                    const allScores = allScoresSnapshot.docs.map(doc => Number(doc.data().CorrectCount) || 0);
                    const populationCount = allScores.length;

                    // --- ฟังก์ชันคำนวณ Percentile แบบถูกต้อง ---
                    const calculateStandardPercentile = (targetScore) => {
                         if (populationCount === 0) return 100;
                         
                         // กรณีมีคนเดียวในระบบ (คือตัวเราเองที่มีคะแนน Best Score อยู่ใน DB)
                         if (populationCount === 1) {
                             // ให้เทียบกับคะแนนนั้น: 
                             // ถ้าคะแนนที่ส่งมา (targetScore) >= คะแนนใน DB -> 100%
                             // ถ้าคะแนนที่ส่งมา น้อยกว่า คะแนนใน DB -> 0%
                             const singleBestScore = allScores[0];
                             return targetScore >= singleBestScore ? 100 : 0;
                         }

                         // กรณีมีหลายคน: สูตร (จำนวนคนที่คะแนนน้อยกว่าเรา / จำนวนคนทั้งหมด) * 100
                         const countBeat = allScores.filter(s => s < targetScore).length;
                         return (countBeat / populationCount) * 100;
                    };
                    // ------------------------------------------

                    currentPercentile = calculateStandardPercentile(score);
                    bestPercentile = calculateStandardPercentile(bestScoreData.CorrectCount);
                }
            }

            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: score,
                    accuracy: accuracy,
                    percentile: parseFloat(currentPercentile.toFixed(2))
                },
                best: {
                    score: bestScoreData.CorrectCount,
                    accuracy: bestScoreData.Accuracy,
                    percentile: parseFloat(bestPercentile.toFixed(2))
                }
            });

        } catch (error) {
            console.error("Error submitGSCScore:", error);
            res.status(500).json({ success: false, message: `Save failed: ${error.message}` });
        }
    });
});

// ==========================================
// 12. APR (Approximation Test) LOGIC - FINAL (Smart Select & Correct Stats)
// ==========================================

// ==========================================
// 12. APR (Approximation Test) LOGIC - FINAL FIXED
// ==========================================

// ⚠️ สำคัญ: ประกาศตัวแปร Cache ไว้ข้างนอกสุด (Global Scope)
let cachedAPRData = {
    questions: null,
    timestamp: 0
};
const CACHE_DURATION = 1000 * 60 * 20; // Cache อยู่ได้ 20 นาที

// Helper Function: การสุ่มแบบ Fisher-Yates
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Helper Function: สุ่มแบบกระจายหมวดหมู่
function getBalancedQuestions(allQuestions, count) {
    const groups = {};
    allQuestions.forEach(q => {
        const type = q.type || 'General';
        if (!groups[type]) groups[type] = [];
        groups[type].push(q);
    });

    const types = Object.keys(groups);
    if (types.length === 0) return [];

    let selected = [];
    const baseCountPerType = Math.floor(count / types.length);
    let remainder = count % types.length;

    types.forEach(type => {
        const shuffledGroup = shuffleArray([...groups[type]]); 
        const take = baseCountPerType + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        selected.push(...shuffledGroup.slice(0, take));
    });

    if (selected.length < count) {
        const usedIds = new Set(selected.map(q => q.id));
        const pool = shuffleArray(allQuestions.filter(q => !usedIds.has(q.id)));
        selected.push(...pool.slice(0, count - selected.length));
    }

    return shuffleArray(selected);
}

// API: getAPRQuizData (ดึงโจทย์ทั้งหมด + Cache)
exports.getAPRQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const mode = req.query.mode || 'practice';
            const QUESTION_LIMIT = mode === 'test' ? 25 : 50; 

            // 1. ดึงข้อมูล (Load Global Pool from Cache/DB)
            let allQuestions = [];
            const now = Date.now();
            
            // เช็คว่ามี cachedAPRData หรือไม่ (ป้องกัน Error)
            if (cachedAPRData && cachedAPRData.questions && (now - cachedAPRData.timestamp < CACHE_DURATION)) {
                console.log("Serving APR from Memory Cache");
                allQuestions = [...cachedAPRData.questions];
            } else {
                console.log("Fetching ALL APR questions from Firestore (Global Pool)");
                const questionsRef = db.collection('Exam_APR');
                
                // ดึงทั้งหมดโดยไม่สนใจ SetID
                const snapshot = await questionsRef.get();

                if (snapshot.empty) {
                    res.json({ success: false, error: "No questions found in database." });
                    return;
                }

                snapshot.forEach(doc => {
                    const data = doc.data();
                    allQuestions.push({
                        id: data.id,
                        type: data.questionType || 'General',
                        questionText: data.text || "No Question Text",
                        questionImage: (data.hasImage && data.hasImage !== "") ? data.hasImage : "",
                        optionA: data.choices ? data.choices.A : "",
                        optionB: data.choices ? data.choices.B : "",
                        optionC: data.choices ? data.choices.C : "",
                        optionD: data.choices ? data.choices.D : "",
                        correctAnswer: data.correctAnswer ? data.correctAnswer.trim().toUpperCase() : "",
                        explanation: data.description || ""
                    });
                });

                // บันทึก Cache
                cachedAPRData = {
                    questions: allQuestions,
                    timestamp: now
                };
                console.log(`Cached ${allQuestions.length} questions.`);
            }

            // 2. เลือกโจทย์ตาม Mode
            let finalQuestions = [];
            
            if (mode === 'test') {
                finalQuestions = getBalancedQuestions(allQuestions, QUESTION_LIMIT);
            } else {
                // Practice: สุ่มมั่วๆ จากกองใหญ่เลย
                finalQuestions = shuffleArray([...allQuestions]).slice(0, QUESTION_LIMIT);
            }

            res.json({ success: true, questions: finalQuestions });

        } catch (e) {
            console.error("Error getAPRQuizData:", e);
            res.status(500).json({ success: false, error: e.message });
        }
    });
});

// API: บันทึกคะแนน (Logic: Current Score คำนวณดิบ / Best Score อวยยศ 100%)
exports.submitAPRScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const data = req.body;
            const userEmail = data.email;
            
            if (!userEmail) {
                res.status(400).json({ success: false, message: 'Missing Email' });
                return;
            }

            const score = Number(data.score) || 0;
            const total = Number(data.total) || 0;
            const timeSpent = Number(data.timeSpent) || 0; // รับค่าเวลา (ทศนิยม)
            const attempted = Number(data.attempted) || 0;
            const accuracy = attempted > 0 ? parseFloat(((score / attempted) * 100).toFixed(2)) : 0;
            const mode = data.mode || 'test';
            
            const normalizedEmail = userEmail.toLowerCase().trim();
            const setId = "APR"; 

            const newScoreData = {
                Email: userEmail,
                NormalizedEmail: normalizedEmail,
                SetID: setId,
                TestType: mode,
                CorrectCount: score,
                TotalQuestions: total,
                Accuracy: accuracy,
                TimeSpent: timeSpent,
                Timestamp: FieldValue.serverTimestamp()
            };

            const resultsRef = db.collection("Results");
            let isNewBest = false;
            let finalBestData = { ...newScoreData };

            // 1. Check & Update Best Score
            const snapshot = await resultsRef
                .where("NormalizedEmail", "==", normalizedEmail)
                .where("SetID", "==", setId)
                .where("TestType", "==", mode)
                .limit(1)
                .get();

            if (snapshot.empty) {
                await resultsRef.add(newScoreData);
                isNewBest = true;
            } else {
                const oldDoc = snapshot.docs[0];
                const oldData = oldDoc.data();
                const oldScore = Number(oldData.CorrectCount) || 0;

                if (score > oldScore) {
                    await oldDoc.ref.update(newScoreData);
                    isNewBest = true;
                } else {
                    finalBestData = {
                        CorrectCount: oldScore,
                        Accuracy: oldData.Accuracy,
                        TimeSpent: oldData.TimeSpent || 0
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile (แก้ไขให้ Current คิดตามจริง / Best คิดแบบให้เกียรติที่ 1)
            let currentPercentile = 0;
            let bestPercentile = 0;

            if (mode === 'test') {
                const allScoresSnapshot = await resultsRef
                    .where("SetID", "==", setId)
                    .where("TestType", "==", "test")
                    .select('CorrectCount')
                    .get();

                if (!allScoresSnapshot.empty) {
                    const allScores = [];
                    allScoresSnapshot.forEach(doc => {
                        allScores.push(Number(doc.data().CorrectCount) || 0);
                    });

                    const populationCount = allScores.length;
                    const maxScoreInDB = Math.max(...allScores); 

                    const calculatePercentile = (targetScore, isBestCalculation) => {
                        if (populationCount === 0) return 0;
                        
                        // ⭐️ เฉพาะ Best Score เท่านั้น: ถ้าเป็นคะแนนสูงสุด ให้ 100% เลย
                        if (isBestCalculation && targetScore >= maxScoreInDB) return 100;

                        // ⭐️ Current Score (และ Best ที่ยังไม่ Top): คำนวณตามสูตร (ชนะกี่คน / ทั้งหมด)
                        // ถ้าเล่นคนเดียว (Beat=0) ก็จะได้ 0% ซึ่งถูกต้องแล้ว
                        const countBeat = allScores.filter(s => s < targetScore).length;
                        return (countBeat / populationCount) * 100;
                    };

                    currentPercentile = calculatePercentile(score, false); // false = ห้ามปัดเป็น 100%
                    bestPercentile = calculatePercentile(finalBestData.CorrectCount, true); // true = ยอมให้ 100% ได้
                }
            }

            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: score,
                    accuracy: accuracy,
                    timeSpent: timeSpent, 
                    attempted: attempted,
                    percentile: parseFloat(currentPercentile.toFixed(2))
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: parseFloat(bestPercentile.toFixed(2))
                }
            });

        } catch (error) {
            console.error("Error submitAPRScore:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
});