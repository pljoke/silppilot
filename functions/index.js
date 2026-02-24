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

            const resultsRef = db.collection("Results");
            const customDocId = `FOLDING_BOX_${difficulty}_${userEmail}`;
            
            let isNewBest = false;
            let finalBestData = { 
                PerformanceScore: performanceScore,
                CorrectCount: correctCount,
                Accuracy: scoreData.accuracy,
                TimeUsed: scoreData.timeUsed
            };

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set({
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correctCount,
                    TotalQuestions: totalQuestions,
                    Accuracy: scoreData.accuracy,
                    TimeUsed: scoreData.timeUsed,
                    Answers: JSON.stringify(scoreData.userAnswers),
                    PerformanceScore: performanceScore
                });
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.PerformanceScore) || 0;
                previousBestScore = oldScore; 
                
                if (performanceScore > oldScore) {
                    await resultsRef.doc(customDocId).set({
                        Timestamp: new Date(),
                        UserEmail: userEmail,
                        NormalizedEmail: normalizedUserEmail,
                        SetID: setId,
                        CorrectCount: correctCount,
                        TotalQuestions: totalQuestions,
                        Accuracy: scoreData.accuracy,
                        TimeUsed: scoreData.timeUsed,
                        Answers: JSON.stringify(scoreData.userAnswers),
                        PerformanceScore: performanceScore
                    });
                    isNewBest = true;
                } else {
                    finalBestData = {
                        PerformanceScore: oldScore,
                        CorrectCount: oldData.CorrectCount,
                        Accuracy: oldData.Accuracy,
                        TimeUsed: oldData.TimeUsed || 0
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allOtherScores = [];
            
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== customDocId) {
                    allOtherScores.push(Number(doc.data().PerformanceScore) || 0);
                }
            });

            const targetScore = performanceScore;
            const bestScore = finalBestData.PerformanceScore;

            if (allOtherScores.length === 0) {
                if (previousBestScore !== null) {
                    currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                    currentRank = targetScore >= previousBestScore ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
                bestPercentile = 100;
                bestRank = 1;
            } else {
                const countBeatCurrent = allOtherScores.filter(s => s <= targetScore).length; // ใช้ <= เหมือนต้นฉบับ
                const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                currentRank = countGreaterCurrent + 1;

                const countBeatBest = allOtherScores.filter(s => s <= bestScore).length;
                const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                bestRank = countGreaterBest + 1;
            }

            totalUsers = allOtherScores.length + 1;

            // ส่งข้อมูลกลับตาม Format ใหม่
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: correctCount,
                    accuracy: scoreData.accuracy,
                    timeUsed: scoreData.timeUsed, 
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

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
            const customDocId = `SCS_2024_${difficulty}_${userEmail}`;
            const currentAccuracy = scoreData.accuracy || 0;
            
            let isNewBest = false;
            let finalBestData = { 
                PerformanceScore: performanceScore,
                CorrectCount: correct,
                Accuracy: currentAccuracy,
                TimeUsed: scoreData.timeUsed
            };

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set({
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correct,
                    TotalQuestions: total,
                    Accuracy: currentAccuracy,
                    TimeUsed: scoreData.timeUsed,
                    Answers: JSON.stringify({ isFail: scoreData.isFail }),
                    PerformanceScore: performanceScore,
                    Difficulty: difficulty
                });
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.PerformanceScore) || 0;
                previousBestScore = oldScore; 
                
                if (performanceScore > oldScore) {
                    await resultsRef.doc(customDocId).set({
                        Timestamp: new Date(),
                        UserEmail: userEmail,
                        NormalizedEmail: normalizedUserEmail,
                        SetID: setId,
                        CorrectCount: correct,
                        TotalQuestions: total,
                        Accuracy: currentAccuracy,
                        TimeUsed: scoreData.timeUsed,
                        Answers: JSON.stringify({ isFail: scoreData.isFail }),
                        PerformanceScore: performanceScore,
                        Difficulty: difficulty
                    });
                    isNewBest = true;
                } else {
                    finalBestData = {
                        PerformanceScore: oldScore,
                        CorrectCount: oldData.CorrectCount,
                        Accuracy: oldData.Accuracy,
                        TimeUsed: oldData.TimeUsed || 0
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allOtherScores = [];
            
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== customDocId) {
                    allOtherScores.push(Number(doc.data().PerformanceScore) || 0);
                }
            });

            const targetScore = performanceScore;
            const bestScore = finalBestData.PerformanceScore;

            if (allOtherScores.length === 0) {
                if (previousBestScore !== null) {
                    currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                    currentRank = targetScore >= previousBestScore ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
                bestPercentile = 100;
                bestRank = 1;
            } else {
                const countBeatCurrent = allOtherScores.filter(s => s < targetScore).length;
                const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                currentRank = countGreaterCurrent + 1;

                const countBeatBest = allOtherScores.filter(s => s < bestScore).length;
                const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                bestRank = countGreaterBest + 1;
            }

            totalUsers = allOtherScores.length + 1;

            // ส่งข้อมูลกลับตาม Format ใหม่
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: correct,
                    accuracy: currentAccuracy,
                    timeSpent: scoreData.timeUsed, 
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

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
            const currentAccuracy = scoreData.accuracy || 0;

            // สูตรคำนวณ Performance Score
            const performanceScore = (attempted > 0)
                ? (correct / total) * (correct / attempted) * 100
                : 0;

            const resultsRef = db.collection("Results");
            const customDocId = `SCS_ORIGINAL_${difficulty}_${userEmail}`;

            let isNewBest = false;
            let finalBestData = { 
                PerformanceScore: performanceScore,
                CorrectCount: correct,
                Accuracy: currentAccuracy,
                TimeUsed: scoreData.timeUsed
            };

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set({
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correct,
                    TotalQuestions: total,
                    Accuracy: currentAccuracy,
                    TimeUsed: scoreData.timeUsed,
                    PerformanceScore: performanceScore,
                    Difficulty: difficulty
                });
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.PerformanceScore) || 0;
                previousBestScore = oldScore; 
                
                if (performanceScore > oldScore) {
                    await resultsRef.doc(customDocId).set({
                        Timestamp: new Date(),
                        UserEmail: userEmail,
                        NormalizedEmail: normalizedUserEmail,
                        SetID: setId,
                        CorrectCount: correct,
                        TotalQuestions: total,
                        Accuracy: currentAccuracy,
                        TimeUsed: scoreData.timeUsed,
                        PerformanceScore: performanceScore,
                        Difficulty: difficulty
                    });
                    isNewBest = true;
                } else {
                    finalBestData = {
                        PerformanceScore: oldScore,
                        CorrectCount: oldData.CorrectCount,
                        Accuracy: oldData.Accuracy,
                        TimeUsed: oldData.TimeUsed || 0
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allOtherScores = [];
            
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== customDocId) {
                    allOtherScores.push(Number(doc.data().PerformanceScore) || 0);
                }
            });

            const targetScore = performanceScore;
            const bestScore = finalBestData.PerformanceScore;

            if (allOtherScores.length === 0) {
                if (previousBestScore !== null) {
                    currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                    currentRank = targetScore >= previousBestScore ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
                bestPercentile = 100;
                bestRank = 1;
            } else {
                const countBeatCurrent = allOtherScores.filter(s => s < targetScore).length;
                const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                currentRank = countGreaterCurrent + 1;

                const countBeatBest = allOtherScores.filter(s => s < bestScore).length;
                const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                bestRank = countGreaterBest + 1;
            }

            totalUsers = allOtherScores.length + 1;

            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: correct,
                    accuracy: currentAccuracy,
                    timeSpent: scoreData.timeUsed, 
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

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

            const correct = scoreData.correctCount;
            const total = scoreData.totalQuestions || 100;
            const attempted = scoreData.totalAnswered;
            const isFail = scoreData.isFail || false;

            const currentAccuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
            
            // คำนวณ Performance Score แบบเดียวกับระบบหลัก
            const performanceScore = (!isFail && attempted > 0)
                ? (correct / total) * (correct / attempted) * 100
                : 0;

            const resultsRef = db.collection("Results");
            const customDocId = `SCN_${difficulty}_${userEmail}`;
            
            let isNewBest = false;
            let finalBestData = { 
                PerformanceScore: performanceScore,
                CorrectCount: correct,
                Accuracy: currentAccuracy,
                TimeUsed: scoreData.timeUsed
            };

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set({
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: correct,
                    TotalQuestions: total,
                    Accuracy: currentAccuracy,
                    TimeUsed: scoreData.timeUsed,
                    IsFail: isFail,
                    PerformanceScore: performanceScore,
                    Difficulty: difficulty
                });
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.PerformanceScore) || 0;
                previousBestScore = oldScore; 
                
                // ใช้ Performance Score เป็นเกณฑ์หลักในการวัด
                if (performanceScore > oldScore) {
                    await resultsRef.doc(customDocId).set({
                        Timestamp: new Date(),
                        UserEmail: userEmail,
                        NormalizedEmail: normalizedUserEmail,
                        SetID: setId,
                        CorrectCount: correct,
                        TotalQuestions: total,
                        Accuracy: currentAccuracy,
                        TimeUsed: scoreData.timeUsed,
                        IsFail: isFail,
                        PerformanceScore: performanceScore,
                        Difficulty: difficulty
                    });
                    isNewBest = true;
                } else {
                    finalBestData = {
                        PerformanceScore: oldScore,
                        CorrectCount: oldData.CorrectCount,
                        Accuracy: oldData.Accuracy,
                        TimeUsed: oldData.TimeUsed || 0
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allOtherScores = [];
            
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== customDocId) {
                    allOtherScores.push(Number(doc.data().PerformanceScore) || 0);
                }
            });

            const targetScore = performanceScore;
            const bestScore = finalBestData.PerformanceScore;

            if (allOtherScores.length === 0) {
                if (previousBestScore !== null) {
                    currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                    currentRank = targetScore >= previousBestScore ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
                bestPercentile = 100;
                bestRank = 1;
            } else {
                const countBeatCurrent = allOtherScores.filter(s => s <= targetScore).length;
                const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                currentRank = countGreaterCurrent + 1;

                const countBeatBest = allOtherScores.filter(s => s <= bestScore).length;
                const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                bestRank = countGreaterBest + 1;
            }

            totalUsers = allOtherScores.length + 1;

            // ส่งข้อมูลกลับตาม Format ใหม่
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: correct,
                    accuracy: currentAccuracy,
                    timeSpent: scoreData.timeUsed, 
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

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
exports.getRubik3D2024QuizData = functions.https.onRequest((req, res) => {
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
exports.saveRubik3D2024Score = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const scoreData = req.body;
            const userEmail = scoreData.userEmail;
            if (!userEmail) throw new Error("User email missing.");

            const difficulty = scoreData.difficulty || 'normal';
            const setId = `RUBIK_3D_2024_${difficulty.toUpperCase()}`;
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

            const resultsRef = db.collection("Results");
            const customDocId = `RUBIK_3D_2024_${difficulty}_${userEmail}`;
            const currentAccuracy = answeredCount > 0 ? (calculatedCorrectCount / answeredCount) * 100 : 0;
            
            let isNewBest = false;
            let finalBestData = { 
                PerformanceScore: performanceScore,
                CorrectCount: calculatedCorrectCount,
                Accuracy: currentAccuracy,
                TimeUsed: scoreData.timeUsed
            };

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set({
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: calculatedCorrectCount,
                    TotalQuestions: totalQuestions,
                    Accuracy: currentAccuracy,
                    TimeUsed: scoreData.timeUsed,
                    PerformanceScore: performanceScore,
                    Difficulty: difficulty
                });
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.PerformanceScore) || 0;
                previousBestScore = oldScore; 
                
                if (performanceScore > oldScore) {
                    await resultsRef.doc(customDocId).set({
                        Timestamp: new Date(),
                        UserEmail: userEmail,
                        NormalizedEmail: normalizedUserEmail,
                        SetID: setId,
                        CorrectCount: calculatedCorrectCount,
                        TotalQuestions: totalQuestions,
                        Accuracy: currentAccuracy,
                        TimeUsed: scoreData.timeUsed,
                        PerformanceScore: performanceScore,
                        Difficulty: difficulty
                    });
                    isNewBest = true;
                } else {
                    finalBestData = {
                        PerformanceScore: oldScore,
                        CorrectCount: oldData.CorrectCount,
                        Accuracy: oldData.Accuracy,
                        TimeUsed: oldData.TimeUsed || 0
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allOtherScores = [];
            
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== customDocId) {
                    allOtherScores.push(Number(doc.data().PerformanceScore) || 0);
                }
            });

            const targetScore = performanceScore;
            const bestScore = finalBestData.PerformanceScore;

            if (allOtherScores.length === 0) {
                if (previousBestScore !== null) {
                    currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                    currentRank = targetScore >= previousBestScore ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
                bestPercentile = 100;
                bestRank = 1;
            } else {
                const countBeatCurrent = allOtherScores.filter(s => s <= targetScore).length;
                const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                currentRank = countGreaterCurrent + 1;

                const countBeatBest = allOtherScores.filter(s => s <= bestScore).length;
                const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                bestRank = countGreaterBest + 1;
            }

            totalUsers = allOtherScores.length + 1;

            // ส่งข้อมูลกลับตาม Format ใหม่
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: calculatedCorrectCount,
                    accuracy: currentAccuracy,
                    timeSpent: scoreData.timeUsed, 
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

        } catch (e) {
            console.error("Error saveRubik3DScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// --- API: Get Best Score ---
exports.getBestRubik3D2024Score = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userEmail = req.query.email;
            const difficulty = req.query.difficulty || 'normal';
            const setId = `RUBIK_3D_2024_${difficulty.toUpperCase()}`;
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
            const isFail = scoreData.isFail || false;

            // ถ้า isFail (เช่นทำไม่ทัน หรือกดข้ามใน Test Mode) ให้ score เป็น 0 (ตาม Logic SCT เดิม)
            const performanceScore = (!isFail && attemptedCount > 0 && totalQuestions > 0)
                ? (correctCount / totalQuestions) * (correctCount / attemptedCount) * 100
                : 0;

            const resultsRef = db.collection("Results");
            const customDocId = `SCT_${difficulty}_${userEmail}`;

            let isNewBest = false;
            let finalBestData = { 
                PerformanceScore: performanceScore,
                CorrectCount: correctCount,
                Accuracy: scoreData.accuracy,
                TimeUsed: scoreData.timeUsed
            };

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set({
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
                    Difficulty: difficulty,
                    IsFail: isFail
                });
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.PerformanceScore) || 0;
                previousBestScore = oldScore; 
                
                if (performanceScore > oldScore) {
                    await resultsRef.doc(customDocId).set({
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
                        Difficulty: difficulty,
                        IsFail: isFail
                    });
                    isNewBest = true;
                } else {
                    finalBestData = {
                        PerformanceScore: oldScore,
                        CorrectCount: oldData.CorrectCount,
                        Accuracy: oldData.Accuracy,
                        TimeUsed: oldData.TimeUsed || 0
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allOtherScores = [];
            
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== customDocId) {
                    allOtherScores.push(Number(doc.data().PerformanceScore) || 0);
                }
            });

            const targetScore = performanceScore;
            const bestScore = finalBestData.PerformanceScore;

            if (allOtherScores.length === 0) {
                if (previousBestScore !== null) {
                    currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                    currentRank = targetScore >= previousBestScore ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
                bestPercentile = 100;
                bestRank = 1;
            } else {
                const countBeatCurrent = allOtherScores.filter(s => s <= targetScore).length;
                const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                currentRank = countGreaterCurrent + 1;

                const countBeatBest = allOtherScores.filter(s => s <= bestScore).length;
                const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                bestRank = countGreaterBest + 1;
            }

            totalUsers = allOtherScores.length + 1;

            // ส่งข้อมูลกลับตาม Format ใหม่
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: correctCount,
                    accuracy: scoreData.accuracy,
                    timeSpent: scoreData.timeUsed,
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

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
            const countBeatBest = allScores.filter(s => s <= bestRow.PerformanceScore).length;
            const countGreaterBest = allScores.filter(s => s > bestRow.PerformanceScore).length;
            
            const bestPercentile = (countBeatBest / allScores.length) * 100;
            const bestRank = countGreaterBest + 1;
            const totalUsers = allScores.length;

            res.json({
                success: true,
                data: {
                    bestScore: bestRow.CorrectCount,
                    totalQuestions: bestRow.TotalQuestions,
                    bestAccuracy: bestRow.Accuracy,
                    bestPercentile: Math.round(bestPercentile),
                    bestRank: String(bestRank),
                    totalUsers: String(totalUsers)
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

            let isNewBest = false;
            let finalBestData = { ...scoreData };
            const customDocId = `GSC_${testType.toLowerCase()}_${userEmail}`;

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set(scoreData);
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.CorrectCount) || 0;
                const oldTime = Number(oldData.TimeSpent) || 999999;
                previousBestScore = oldScore; 
                
                if (score > oldScore || (score === oldScore && timeSpent < oldTime)) {
                    await resultsRef.doc(customDocId).set(scoreData);
                    isNewBest = true;
                } else {
                    finalBestData = {
                        CorrectCount: oldScore,
                        Accuracy: oldData.Accuracy,
                        TimeSpent: oldTime
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            if (testType.toLowerCase() === 'test') {
                const allScoresSnapshot = await resultsRef
                    .where("SetID", "==", "GSC")
                    .where("TestType", "in", ["test", "Test"]) 
                    .get();

                const allOtherScores = [];
                
                allScoresSnapshot.forEach(doc => {
                    if (doc.id !== customDocId) {
                        allOtherScores.push(Number(doc.data().CorrectCount) || 0);
                    }
                });

                const targetScore = score;
                const bestScore = finalBestData.CorrectCount;

                if (allOtherScores.length === 0) {
                    if (previousBestScore !== null) {
                        currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                        currentRank = targetScore >= previousBestScore ? 1 : 2;
                    } else {
                        currentPercentile = 100;
                        currentRank = 1;
                    }
                    bestPercentile = 100;
                    bestRank = 1;
                } else {
                    const countBeatCurrent = allOtherScores.filter(s => s < targetScore).length;
                    const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                    currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                    currentRank = countGreaterCurrent + 1;

                    const countBeatBest = allOtherScores.filter(s => s < bestScore).length;
                    const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                    bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                    bestRank = countGreaterBest + 1;
                }

                totalUsers = allOtherScores.length + 1;
            }

            // ส่งข้อมูลกลับตาม Format ใหม่ (แปลง Rank เป็น String)
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: score,
                    accuracy: accuracy,
                    timeSpent: timeSpent, 
                    attempted: attempted,
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

        } catch (error) {
            console.error("Error submitGSCScore:", error);
            res.status(500).json({ success: false, message: `Save failed: ${error.message}` });
        }
    });
});

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
            const customDocId = `APR_${mode.toLowerCase()}_${userEmail}`;

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set(newScoreData);
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.CorrectCount) || 0;
                previousBestScore = oldScore; // ✅ เก็บค่าเก่าไว้ใช้เปรียบเทียบกรณีมีสอบคนเดียว
                
                if (score > oldScore || (score === oldScore && timeSpent < (Number(oldData.TimeSpent) || 999999))) {
                    await resultsRef.doc(customDocId).set(newScoreData);
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

            // 2. คำนวณ Percentile, Rank และ Total Users (Master Template)
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            if (mode.toLowerCase() === 'test') {
                const allScoresSnapshot = await resultsRef
                    .where("SetID", "==", setId)
                    .where("TestType", "in", ["test", "Test"]) 
                    .get();

                const allOtherScores = [];
                
                allScoresSnapshot.forEach(doc => {
                    if (doc.id !== customDocId) { // ✅ ไม่เอาคะแนนที่เป็น Document ของตัวเองมาคิดซ้ำ
                        allOtherScores.push(Number(doc.data().CorrectCount) || 0);
                    }
                });

                const targetScore = score;
                const bestScore = finalBestData.CorrectCount;

                if (allOtherScores.length === 0) {
                    // ✅ กรณีในระบบมีแค่คุณสอบคนเดียว ให้เทียบกับประวัติเก่าของตัวเอง
                    if (previousBestScore !== null) {
                        currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                        currentRank = targetScore >= previousBestScore ? 1 : 2;
                    } else {
                        currentPercentile = 100;
                        currentRank = 1;
                    }
                    bestPercentile = 100;
                    bestRank = 1;
                } else {
                    // ✅ กรณีมีคนอื่นสอบด้วย ให้คำนวณตามสูตรปกติ
                    
                    // หา Current Score Rank/Percentile
                    const countBeatCurrent = allOtherScores.filter(s => s < targetScore).length;
                    const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                    currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                    currentRank = countGreaterCurrent + 1;

                    // หา Best Score Rank/Percentile
                    const countBeatBest = allOtherScores.filter(s => s < bestScore).length;
                    const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                    bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                    bestRank = countGreaterBest + 1;
                }

                totalUsers = allOtherScores.length + 1;
            }

            // ✅ บังคับแปลงค่า Rank ให้เป็น String
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: score,
                    accuracy: accuracy,
                    timeSpent: timeSpent, 
                    attempted: attempted,
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

        } catch (error) {
            console.error("Error submitAPRScore:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
});

// ============================================================================
// 4. STR (Short Term Memory - Story) API
// ============================================================================

// 4.1 ดึงเนื้อเรื่องและคำถาม (สุ่ม SetID)
exports.getSTRStory = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            // 1. ดึงเนื้อเรื่องทั้งหมดจากฐานข้อมูล (id == 0 คือ Story)
            const storiesSnapshot = await db.collection('Exam_STR').where('id', '==', 0).get();
            if (storiesSnapshot.empty) {
                return res.status(404).json({ success: false, message: 'No stories found in database' });
            }

            // 2. สุ่มเลือกมา 1 เรื่อง
            const stories = [];
            storiesSnapshot.forEach(doc => stories.push(doc.data()));
            const randomStory = stories[Math.floor(Math.random() * stories.length)];
            const setId = randomStory.setId; // ชุดที่สุ่มได้ (เช่น STR001)

            // 3. ดึงข้อมูลทั้งหมดของ Set นั้น (เอา where id > 0 และ orderBy ออกเพื่อแก้ปัญหา Index)
            const questionsSnapshot = await db.collection('Exam_STR')
                .where('setId', '==', setId)
                .get();

            const questions = [];
            questionsSnapshot.forEach(doc => {
                const d = doc.data();
                
                // 4. ใช้ JavaScript กรองเฉพาะที่เป็นคำถาม (id > 0)
                if (d.id > 0) {
                    questions.push({
                        id: d.id, // เก็บ id ไว้ใช้เรียงลำดับ
                        questionText: d.text,
                        optionA: d.choices.A,
                        optionB: d.choices.B,
                        optionC: d.choices.C,
                        optionD: d.choices.D,
                        correctAnswer: d.correctAnswer
                    });
                }
            });

            // 5. เรียงลำดับคำถามตาม id (1, 2, 3...) ด้วย JavaScript
            questions.sort((a, b) => a.id - b.id);

            res.status(200).json({
                success: true,
                story: randomStory.text,
                questions: questions
            });
        } catch (error) {
            console.error("Error fetching STR story:", error);
            // แก้ไข key จาก 'error' เป็น 'message' เพื่อให้ Frontend อ่านค่าได้ตรงกัน
            res.status(500).json({ success: false, message: error.message });
        }
    });
});

// 4.2 บันทึกคะแนน STR (เฉพาะคะแนนที่ดีที่สุด) และคำนวณ Percentile
exports.saveSTRScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            // ✅ รับค่า difficulty มาด้วย (ถ้าใน Frontend ไม่ได้ส่งมา จะตั้งค่าเริ่มต้นเป็น 'normal')
            const { userEmail, difficulty = 'normal', storyCorrectCount, mathCorrectCount, totalScore, totalQuestions, accuracy, timeUsed } = req.body;
            
            const gameType = 'STR';
            const scoresRef = db.collection('Results');
            const allScoresSnapshot = await scoresRef.where('gameType', '==', gameType).get();
            
            let lowerOrEqualCount = 0;
            let totalUsers = 0;
            let userPreviousBest = -1;
            let existingDocId = null;

            allScoresSnapshot.forEach(doc => {
                totalUsers++;
                const data = doc.data();
                
                if (data.userEmail === userEmail) {
                    userPreviousBest = data.totalScore;
                    existingDocId = doc.id; // เก็บ ID เก่าไว้ ไม่ว่าจะเป็น Auto-ID หรือ ID ที่จัดระเบียบแล้ว
                }

                if (data.totalScore <= totalScore) {
                    lowerOrEqualCount++;
                }
            });

            const newScoreData = {
                userEmail,
                gameType,
                difficulty, // ✅ บันทึกระดับความยากลงไปด้วย
                storyCorrectCount,
                mathCorrectCount,
                totalScore,
                totalQuestions,
                accuracy,
                timeUsed,
                timestamp: FieldValue.serverTimestamp() 
            };

            // ✅ สร้าง Custom Document ID: รูปแบบ "STR_normal_user@gmail.com"
            const customDocId = `${gameType}_${difficulty}_${userEmail}`;
            let isNewBest = false;
            let finalBestData = {
                totalScore: totalScore,
                accuracy: accuracy
            };

            if (existingDocId) {
                if (totalScore > userPreviousBest) {
                    await scoresRef.doc(customDocId).set(newScoreData);
                    isNewBest = true;
                    if (existingDocId !== customDocId) {
                        await scoresRef.doc(existingDocId).delete();
                    }
                } else {
                    isNewBest = false;
                    finalBestData = {
                        totalScore: userPreviousBest,
                        accuracy: accuracy // อันนี้อาจจะคลาดเคลื่อนถ้าข้อมูลเก่าไม่มีเก็บ แต่ถือว่าอิงอันล่าสุดไปก่อน
                    };
                }
            } else {
                await scoresRef.doc(customDocId).set(newScoreData);
                isNewBest = true;
            }

            // คำนวณ Ranking ใหม่ทั้งหมด
            const allScoresRefresh = await scoresRef.where('gameType', '==', gameType).get();
            const allOtherScores = [];
            
            allScoresRefresh.forEach(doc => {
                if (doc.id !== customDocId && doc.data().userEmail !== userEmail) { // เลี่ยงการดึงคะแนนตัวเองซ้ำ
                    allOtherScores.push(Number(doc.data().totalScore) || 0);
                }
            });

            let currentPercentile = 0;
            let currentRank = 1;
            let bestPercentile = 100;
            let bestRank = 1;

            if (allOtherScores.length === 0) {
                if (userPreviousBest !== -1) {
                    currentPercentile = totalScore >= userPreviousBest ? 100 : 0;
                    currentRank = totalScore >= userPreviousBest ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
            } else {
                const countBeatCurrent = allOtherScores.filter(s => s < totalScore).length;
                const countGreaterCurrent = allOtherScores.filter(s => s > totalScore).length;
                currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                currentRank = countGreaterCurrent + 1;

                const countBeatBest = allOtherScores.filter(s => s < finalBestData.totalScore).length;
                const countGreaterBest = allOtherScores.filter(s => s > finalBestData.totalScore).length;
                bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                bestRank = countGreaterBest + 1;
            }

            let finalTotalUsers = allOtherScores.length + 1;

            // ส่งข้อมูลกลับไปแบบก้อนเดียว
            res.status(200).json({ 
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: totalScore,
                    accuracy: accuracy,
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(finalTotalUsers)
                },
                best: {
                    score: finalBestData.totalScore,
                    accuracy: finalBestData.accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(finalTotalUsers)
                }
            });
        } catch (error) {
            console.error("Error saving STR score:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

// 4.3 ดึงคะแนนที่ดีที่สุดของ STR
exports.getBestSTRScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { email } = req.query;
            if (!email) return res.status(400).json({ success: false, message: 'Email required' });

            // ✅ เปลี่ยนมาใช้ Collection 'Results' และกรองดึงเฉพาะของ STR
            const scoresSnapshot = await db.collection('Results')
                .where('gameType', '==', 'STR')
                .where('userEmail', '==', email)
                .limit(1)
                .get();

            if (scoresSnapshot.empty) {
                return res.status(200).json({ success: true, data: null });
            }

            const d = scoresSnapshot.docs[0].data();

            res.status(200).json({
                success: true,
                data: {
                    bestScore: d.totalScore,
                    bestAccuracy: d.accuracy,
                    bestPercentile: d.percentile,
                    totalQuestions: d.totalQuestions || 27
                }
            });
        } catch (error) {
            console.error("Error getting best STR score:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

// ==========================================
// 13. SRP (Series Picture) LOGIC
// ==========================================

// API 1: ดึงโจทย์ SRP
exports.getSRPQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const mode = req.query.mode || 'practice';
            const QUESTION_LIMIT = 25; // กำหนด 25 ข้อตามที่คุณต้องการ

            const questionsRef = db.collection('Exam_SRP');
            const snapshot = await questionsRef.get();
            
            if (snapshot.empty) {
                return res.json({ success: false, error: "No questions found in database." });
            }

            let allQuestions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                allQuestions.push({
                    id: data.id || doc.id,
                    questionImage: data.QuestionImage || data.image || data.id, // ดึงชื่อไฟล์รูป
                    optionA: data.choices ? data.choices.A : "",
                    optionB: data.choices ? data.choices.B : "",
                    optionC: data.choices ? data.choices.C : "",
                    optionD: data.choices ? data.choices.D : "",
                    optionE: data.choices ? data.choices.E : "", // รองรับช้อยส์ E
                    correctAnswer: data.correctAnswer ? data.correctAnswer.trim().toUpperCase() : ""
                });
            });

            // สุ่มลำดับข้อสอบทั้งหมด
            for (let i = allQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
            }

            // ตัดเอาแค่ 25 ข้อ
            const finalQuestions = allQuestions.slice(0, QUESTION_LIMIT);

            res.json({ success: true, questions: finalQuestions });
        } catch (e) {
            console.error("Error getSRPQuizData:", e);
            res.status(500).json({ success: false, error: e.message });
        }
    });
});

// API 2: บันทึกคะแนน SRP (รองรับ Custom ID และโหมด Test/Practice)
exports.submitSRPScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const data = req.body;
            const userEmail = data.email;
            
            if (!userEmail) return res.status(400).json({ success: false, message: 'Missing Email' });

            const score = Number(data.score) || 0;
            const total = Number(data.total) || 0;
            const timeSpent = Number(data.timeSpent) || 0; 
            const attempted = Number(data.attempted) || 0;
            const accuracy = attempted > 0 ? parseFloat(((score / attempted) * 100).toFixed(2)) : 0;
            const mode = data.mode || 'test';
            
            const normalizedEmail = normalizeGmail(userEmail);
            const setId = "SRP"; 
            const testType = mode; // test หรือ practice

            const newScoreData = {
                Email: userEmail,
                NormalizedEmail: normalizedEmail,
                SetID: setId,
                TestType: testType,
                CorrectCount: score,
                TotalQuestions: total,
                Accuracy: accuracy,
                TimeSpent: timeSpent,
                Timestamp: FieldValue.serverTimestamp()
            };

            const customDocId = `SRP_${testType.toLowerCase()}_${userEmail}`;
            const resultsRef = db.collection("Results");
            
            let isNewBest = false;
            let finalBestData = { ...newScoreData };

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set(newScoreData);
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.CorrectCount) || 0;
                previousBestScore = oldScore; // ✅ เก็บค่าเก่าไว้ใช้เปรียบเทียบกรณีมีสอบคนเดียว
                
                if (score > oldScore || (score === oldScore && timeSpent < (Number(oldData.TimeSpent) || 999999))) {
                    await resultsRef.doc(customDocId).set(newScoreData);
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

            // 2. คำนวณ Percentile, Rank และ Total Users (ถอดแบบจาก MockupTest 100%)
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            if (mode.toLowerCase() === 'test') {
                const allScoresSnapshot = await resultsRef
                    .where("SetID", "==", setId)
                    .where("TestType", "in", ["test", "Test"]) 
                    .get();

                const allOtherScores = [];
                
                allScoresSnapshot.forEach(doc => {
                    if (doc.id !== customDocId) { // ✅ ไม่เอาคะแนนที่เป็น Document ของตัวเองมาคิดซ้ำ
                        allOtherScores.push(Number(doc.data().CorrectCount) || 0);
                    }
                });

                const targetScore = score;
                const bestScore = finalBestData.CorrectCount;

                if (allOtherScores.length === 0) {
                    // ✅ กรณีในระบบมีแค่คุณสอบคนเดียว ให้เทียบกับประวัติเก่าของตัวเอง
                    if (previousBestScore !== null) {
                        currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                        currentRank = targetScore >= previousBestScore ? 1 : 2;
                    } else {
                        currentPercentile = 100;
                        currentRank = 1;
                    }
                    bestPercentile = 100;
                    bestRank = 1;
                } else {
                    // ✅ กรณีมีคนอื่นสอบด้วย ให้คำนวณตามสูตรปกติ
                    
                    // หา Current Score Rank/Percentile
                    const countBeatCurrent = allOtherScores.filter(s => s < targetScore).length;
                    const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                    currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                    currentRank = countGreaterCurrent + 1;

                    // หา Best Score Rank/Percentile
                    const countBeatBest = allOtherScores.filter(s => s < bestScore).length;
                    const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                    bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                    bestRank = countGreaterBest + 1;
                }

                totalUsers = allOtherScores.length + 1; // ✅ รวมตัวเองเข้าไปด้วยเพื่อหาจำนวนคนสอบทั้งหมด
            }

            // ✅ แก้ไข: บังคับแปลงค่า Rank ให้เป็น String เพื่อให้ JSON ส่งข้ามผ่านเน็ตได้ชัวร์ 100% ป้องกันมันกลายเป็น N/A
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: score,
                    accuracy: accuracy,
                    timeSpent: timeSpent, 
                    attempted: attempted,
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

        } catch (error) {
            console.error("Error submitSRPScore:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
});

// ==========================================
// 14. SRN (Series Number) LOGIC
// ==========================================

// API 1: ฟังก์ชันสร้างโจทย์ SRN (Algorithm จาก GAS เดิม)
exports.getSRNQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        try {
            const difficulty = (req.query.difficulty || 'medium').toLowerCase();

            // --- Utility Functions ---
            const _rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            function shuffle(array) { 
                for (let i = array.length - 1; i > 0; i--) { 
                    const j = _rand(0, i);
                    [array[i], array[j]] = [array[j], array[i]]; 
                } 
            }

            // --- Principle Library (Algorithm สร้างโจทย์) ---
            const principleLibrary = [
                { difficulty: "Easy", type: "Arithmetic", explanation: "Two independent series are interleaved. 1st set: plus fixed number. 2nd set: plus fixed number.", generate: () => { const s1 = _rand(1, 10), d1 = _rand(2, 6), s2 = _rand(11, 20), d2 = _rand(2, 6); const series = [s1, s2, s1 + d1, s2 + d2, s1 + 2 * d1, s2 + 2 * d2]; const detail = `\n1st set adds ${d1} (e.g. ${s1}, ${s1 + d1}, ...).\n2nd set adds ${d2} (e.g. ${s2}, ${s2 + d2}, ...).`; return { series, answer: s1 + 3 * d1, detail }; } },
                { difficulty: "Easy", type: "Geometric", explanation: "Two independent series are interleaved. 1st set: geometric (* fixed number). 2nd set: geometric (* fixed number).", generate: () => { const s1 = _rand(2, 4), r1 = _rand(2, 3), s2 = _rand(2, 4), r2 = _rand(2, 3); const series = [s1, s2, s1 * r1, s2 * r2, s1 * r1 * r1, s2 * r2 * r2]; const detail = `\n1st set multiplies by ${r1} (e.g. ${s1}, ${s1 * r1}, ...).\n2nd set multiplies by ${r2} (e.g. ${s2}, ${s2 * r2}, ...).`; return { series, answer: s1 * r1 * r1 * r1, detail }; } },
                { difficulty: "Easy", type: "Arithmetic", explanation: "The series decreases by a fixed number.", generate: () => { const s = _rand(50, 100), d = _rand(3, 12) * -1; const len = _rand(5, 6); const series = []; for (let i = 0; i < len; i++) series.push(s + i * d); const detail = `\nThe pattern is subtracting ${-d} each time.\n(e.g. ${series[0]} - ${-d} = ${series[1]})`; return { series, answer: s + len * d, detail }; } },
                { difficulty: "Easy", type: "Arithmetic", explanation: "The series increases by a fixed number.", generate: () => { const s = _rand(1, 20), d = _rand(5, 25); const len = _rand(5, 6); const series = []; for (let i = 0; i < len; i++) series.push(s + i * d); const detail = `\nThe pattern is adding ${d} each time.\n(e.g. ${series[0]} + ${d} = ${series[1]})`; return { series, answer: s + len * d, detail }; } },
                { difficulty: "Medium", type: "Fibonacci", explanation: "The next number is the sum of the two preceding numbers.", generate: () => { const s1 = _rand(1, 10), s2 = _rand(s1 + 1, s1 + 10); const series = [s1, s2]; for (let i = 2; i < 6; i++) series.push(series[i - 1] + series[i - 2]); const detail = `\n(e.g. ${series[0]} + ${series[1]} = ${series[2]})`; return { series, answer: series[5] + series[4], detail }; } },
                { difficulty: "Medium", type: "Cumulative", explanation: "The next number is the sum of all preceding numbers.", generate: () => { const s1 = _rand(1, 5), s2 = _rand(6, 12); const series = [s1, s2]; for (let i = 2; i < 6; i++) series.push(series.reduce((a, v) => a + v, 0)); const finalSeries = series.slice(0, _rand(5, 6)); const detail = `\n(e.g. ${finalSeries.slice(0, 2).join(' + ')} = ${finalSeries[2]})`; return { series: finalSeries, answer: finalSeries.reduce((a, v) => a + v, 0), detail }; } },
                { difficulty: "Medium", type: "Arithmetic", explanation: "The amount subtracted increases in a regular pattern.", generate: () => { const s = _rand(50, 100), step = _rand(3, 8); const series = [s]; for (let i = 1; i < 7; i++) series.push(series[i - 1] - (i * step)); const finalSeries = series.slice(0, _rand(5, 6)); const detail = `\nThe amount subtracted increases by ${step} each time.\n(e.g. -${step}, -${2 * step}, ...)`; return { series: finalSeries, answer: series[finalSeries.length], detail }; } },
                { difficulty: "Medium", type: "Geometric", explanation: "The next number is the product of the two preceding numbers.", generate: () => { const s1 = _rand(2, 3), s2 = _rand(2, 4); const series = [s1, s2]; for (let i = 2; i < 6; i++) series.push(series[i - 1] * series[i - 2]); const detail = `\n(e.g. ${series[0]} * ${series[1]} = ${series[2]})`; return { series: series, answer: series[series.length - 1] * series[series.length - 2], detail }; } },
                { difficulty: "Hard", type: "Interleaved", explanation: "Three independent series are interleaved.", generate: () => { const s1 = _rand(80, 120), d1 = _rand(2, 4) * -1, s2 = _rand(10, 20), r2 = 2, s3 = _rand(1, 5), d3 = 1; const series = []; for (let i = 0; i < 3; i++) { series.push(s1 + (d1 * i)); series.push(s2 * (r2 ** i)); series.push(s3 + (d3 * i)); } const finalSeries = series.slice(0, _rand(6, 7)); const nextIndex = finalSeries.length; const termType = nextIndex % 3; const detail = `\n1st set: starts ${s1}, op: ${d1}\n2nd set: starts ${s2}, op: *${r2}\n3rd set: starts ${s3}, op: +${d3}`; let answer; if (termType === 0) answer = s1 + (d1 * Math.floor(nextIndex / 3)); else if (termType === 1) answer = s2 * (r2 ** Math.floor(nextIndex / 3)); else answer = s3 + (d3 * Math.floor(nextIndex / 3)); return { series: finalSeries, answer, detail }; } },
                { difficulty: "Hard", type: "Interleaved", explanation: "Two independent series are interleaved. 1st set: geometric. 2nd set: arithmetic with increasing steps.", generate: () => { const s1 = _rand(2, 4), r1 = _rand(2, 3), s2 = _rand(1, 5); let currentS2 = s2, step = 2; const series = [s1, s2]; for (let i = 1; i < 4; i++) { series.push(series[series.length - 2] * r1); currentS2 += step; series.push(currentS2); step++; } const finalSeries = series.slice(0, _rand(6, 8)); const nextIndex = finalSeries.length; const lastTermOfSameType = finalSeries[nextIndex - 2]; const detail = `\n1st set (geometric): starts ${s1}, op: *${r1}\n2nd set (arithmetic): starts ${s2}, op: +2, +3, +4, ...`; let answer; if (nextIndex % 2 === 0) { answer = lastTermOfSameType * r1; } else { const k = (nextIndex - 1) / 2; const nextStep = k + 1; answer = lastTermOfSameType + nextStep; } return { series: finalSeries, answer, detail }; } },
                { difficulty: "Hard", type: "Digit Sum", explanation: "The number added is based on the sum of the previous term's digits.", generate: () => { let s = _rand(10, 20); const series = [s]; for (let i = 0; i < 6; i++) { let sum = String(series[i]).split('').reduce((a, d) => a + parseInt(d, 10), 0); series.push(series[i] + sum); } let finalSeries = series.slice(0, _rand(5, 6)); const nextFullTerm = series[finalSeries.length]; const firstTermSum = String(finalSeries[0]).split('').map(Number).reduce((a, b) => a + b, 0); const detail = `\n(e.g. for ${finalSeries[0]}, sum of digits is ${firstTermSum}, so next term is ${finalSeries[0]} + ${firstTermSum} = ${finalSeries[1]})`; return { series: finalSeries, answer: nextFullTerm, detail }; } },
                { difficulty: "Medium", type: "Prime", explanation: "The series consists of consecutive prime numbers.", generate: () => { const p = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]; const i = _rand(0, p.length - 8); const len = _rand(5, 7); const detail = `\nStarts from prime number ${p[i]}.`; return { series: p.slice(i, i + len), answer: p[i + len], detail }; } },
                { difficulty: "Hard", type: "Prime", explanation: "A fixed number is added to (or subtracted from) a sequence of consecutive prime numbers.", generate: () => { const p = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]; const i = _rand(0, p.length - 8); const c = _rand(2, 10) * (Math.random() > 0.5 ? 1 : -1); const len = _rand(5, 7); const primeSlice = p.slice(i, i + len); const series = primeSlice.map(x => x + c); const detail = `\nBased on prime sequence starting from ${primeSlice[0]}.\nFixed number is ${c}.\n(e.g. ${primeSlice[0]} ${c >= 0 ? '+' : ''} ${c} = ${series[0]})`; return { series, answer: p[i + len] + c, detail }; } },
                { difficulty: "Medium", type: "Arithmetic Step-up", explanation: "The amount *added* increases in a regular pattern (e.g., +2, +3, +4...).", generate: () => { const s = _rand(1, 20); const baseStep = _rand(2, 6); const stepInc = _rand(1, 3); const len = _rand(5, 6); const series = [s]; let current = s; let currentStep = baseStep; for (let i = 1; i < len; i++) { current += currentStep; series.push(current); currentStep += stepInc; } const answer = series[series.length - 1] + currentStep; const detail = `\nThe amount added increases by ${stepInc} each time.\n(Pattern: +${baseStep}, +${baseStep + stepInc}, +${baseStep + (2 * stepInc)}, ...)`; return { series, answer, detail }; } },
                { difficulty: "Easy", type: "Geometric Division", explanation: "The series decreases by *dividing* by a fixed number.", generate: () => { const d = _rand(2, 4); const len = _rand(5, 6); const finalAnswer = _rand(2, 5); const series = [finalAnswer]; for (let i = 0; i < len; i++) { series.push(series[series.length - 1] * d); } series.reverse(); const finalSeries = series.slice(0, len); const answer = finalAnswer; const detail = `\nThe pattern is dividing by ${d} each time.\n(e.g. ${finalSeries[0]} / ${d} = ${finalSeries[1]})`; return { series: finalSeries, answer, detail }; } },
                { difficulty: "Medium", type: "Alternating Operations", explanation: "Two different simple operations alternate (e.g., Add X, Subtract Y).", generate: () => { const s = _rand(10, 30); const op1 = _rand(5, 15); const op2 = _rand(2, 10) * -1; const len = _rand(6, 7); const series = [s]; for (let i = 1; i < len; i++) { const prev = series[i - 1]; series.push(i % 2 !== 0 ? prev + op1 : prev + op2); } const answer = (len % 2 !== 0) ? series[len - 1] + op1 : series[len - 1] + op2; const detail = `\nThe pattern alternates between adding ${op1} and subtracting ${-op2}.\n(e.g. ${series[0]} + ${op1} = ${series[1]}, then ${series[1]} + ${op2} = ${series[2]})`; return { series, answer, detail }; } },
                { difficulty: "Medium", type: "Positional (n²)", explanation: "Numbers are based on their position (n) in the sequence (e.g., 1², 2², 3²...).", generate: () => { const startN = _rand(1, 5); const len = _rand(5, 6); const series = []; for (let i = 0; i < len; i++) { series.push((startN + i) * (startN + i)); } const answer = (startN + len) * (startN + len); const detail = `\nPattern is n² (position squared), starting from n=${startN}.\n(e.g. ${startN}² = ${series[0]}, ${startN + 1}² = ${series[1]})`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Positional (n² + c)", explanation: "Numbers are based on their position (n) plus a constant (e.g., n² + c).", generate: () => { const startN = _rand(1, 4); const c = _rand(2, 10); const len = _rand(5, 6); const series = []; for (let i = 0; i < len; i++) { series.push(((startN + i) * (startN + i)) + c); } const answer = ((startN + len) * (startN + len)) + c; const detail = `\nPattern is n² + ${c} (position squared plus a constant), starting from n=${startN}.\n(e.g. ${startN}² + ${c} = ${series[0]})`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Mixed Operation (x*r + d)", explanation: "Each term is (previous term * r) + d.", generate: () => { const s = _rand(2, 6); const r = _rand(2, 3); const d = _rand(1, 5) * (Math.random() > 0.5 ? 1 : -1); const len = _rand(5, 6); const series = [s]; for (let i = 1; i < len; i++) { series.push((series[i - 1] * r) + d); } const answer = (series[len - 1] * r) + d; const d_str = (d >= 0) ? `+ ${d}` : `- ${-d}`; const detail = `\nPattern is (Previous Term * ${r}) ${d_str}.\n(e.g. ${series[0]} * ${r} ${d_str} = ${series[1]})`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Digit Product", explanation: "The number added is the *product* of the previous term's digits.", generate: () => { let series = []; let s; const len = _rand(5, 6); while (series.length < len) { s = _rand(21, 69); if (String(s).includes('0')) continue; series = [s]; for (let i = 0; i < len - 1; i++) { const currentStr = String(series[i]); if (currentStr.includes('0')) { series = []; break; } const prod = currentStr.split('').reduce((a, d) => a * parseInt(d, 10), 1); const nextVal = series[i] + prod; series.push(nextVal); } } const finalSeries = series; const lastTerm = finalSeries[finalSeries.length - 1]; let lastProd = 0; if (!String(lastTerm).includes('0')) { lastProd = String(lastTerm).split('').reduce((a, d) => a * parseInt(d, 10), 1); } const answer = lastTerm + lastProd; const firstProd = String(finalSeries[0]).split('').reduce((a, d) => a * parseInt(d, 10), 1); const detail = `\nAdd the *product* of the previous term's digits.\n(e.g. for ${finalSeries[0]}, digits product is ${firstProd}, so next is ${finalSeries[0]} + ${firstProd} = ${finalSeries[1]})`; return { series: finalSeries, answer, detail }; } },
                { difficulty: "Hard", type: "Interleaved (Arithmetic + n²)", explanation: "Two independent series are interleaved. 1st set: simple arithmetic. 2nd set: positional (n²).", generate: () => { const s1 = _rand(10, 30), d1 = _rand(2, 6); const startN = _rand(1, 4); const len = _rand(6, 7); const series = []; for (let i = 0; i < Math.ceil(len / 2); i++) { series.push(s1 + i * d1); if (series.length < len) { series.push((startN + i) * (startN + i)); } } const finalSeries = series.slice(0, len); const nextIndex = len; const i = Math.floor(nextIndex / 2); let answer; if (nextIndex % 2 === 0) { answer = s1 + i * d1; } else { answer = (startN + i) * (startN + i); } const detail = `\n1st set (Arithmetic): starts ${s1}, op: +${d1}\n2nd set (Positional n²): starts n=${startN} (e.g. ${startN}²=${startN * startN}, ${startN + 1}²=${(startN + 1) * (startN + 1)}, ...)`; return { series: finalSeries, answer, detail }; } },
                { difficulty: "Hard", type: "Third-Order Difference", explanation: "The third-order difference (difference of differences of differences) is constant.", generate: () => { const d3 = _rand(1, 3); let current_d2 = _rand(1, 4); let current_d1 = _rand(2, 6); let current_s = _rand(1, 10); const len = _rand(5, 6); const series = [current_s]; const d1_vals = [current_d1]; const d2_vals = [current_d2]; for (let i = 1; i < len; i++) { current_s += current_d1; series.push(current_s); current_d1 += current_d2; d1_vals.push(current_d1); current_d2 += d3; d2_vals.push(current_d2); } const answer = current_s + current_d1; const detail = `\nThird-order difference is constant (${d3}).\n1st Diffs (e.g. ${d1_vals[0]}, ${d1_vals[1]}, ...)\n2nd Diffs (e.g. ${d2_vals[0]}, ${d2_vals[1]}, ...)`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Interleaved (Arithmetic + 3rd-Order)", explanation: "Two series interleaved. 1st: simple arithmetic (+,-,*). 2nd: a third-order difference series.", generate: () => { const s1 = _rand(5, 15), d1 = _rand(2, 5); const s1_terms = [s1, s1 + d1, s1 + 2 * d1, s1 + 3 * d1]; const d3_2 = _rand(1, 2); let d2_2 = _rand(1, 3); let d1_2 = _rand(1, 4); let s2 = _rand(1, 5); const s2_terms = [s2]; for (let i = 0; i < 3; i++) { s2 += d1_2; s2_terms.push(s2); d1_2 += d2_2; d2_2 += d3_2; } const series = [ s1_terms[0], s2_terms[0], s1_terms[1], s2_terms[1], s1_terms[2], s2_terms[2], s1_terms[3] ]; const answer = s2_terms[3]; const detail = `\nTwo series interleaved (7 terms total).\n1st set (Arithmetic): ${s1_terms[0]}, ${s1_terms[1]}, ... (adds ${d1})\n2nd set (3rd-Order): ${s2_terms[0]}, ${s2_terms[1]}, ... (3rd diff is ${d3_2})`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Power Differences", explanation: "The difference between terms is a sequence of perfect squares (e.g., n²).", generate: () => { let s = _rand(1, 20); const startN = _rand(2, 4); const len = _rand(5, 6); const series = [s]; let diffs = []; for (let i = 0; i < len - 1; i++) { const diff = (startN + i) * (startN + i); diffs.push(diff); s += diff; series.push(s); } const nextDiff = (startN + len - 1) * (startN + len - 1); const answer = series[series.length - 1] + nextDiff; const detail = `\nThe difference between terms follows a pattern of n².\n(Pattern: +${diffs[0]}, +${diffs[1]}, +${diffs[2]}, ...)\n(Based on ${startN}², ${(startN + 1)}², ...)`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Tribonacci", explanation: "The next number is the sum of the *three* preceding numbers.", generate: () => { const s1 = _rand(1, 5); const s2 = _rand(s1 + 1, s1 + 5); const s3 = _rand(s2 + 1, s2 + 5); const len = _rand(5, 6); const series = [s1, s2, s3]; for (let i = 3; i < len; i++) { series.push(series[i - 1] + series[i - 2] + series[i - 3]); } const answer = series[series.length - 1] + series[series.length - 2] + series[series.length - 3]; const detail = `\n(e.g. ${series[0]} + ${series[1]} + ${series[2]} = ${series[3]})`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Complex Positional", explanation: "Numbers are based on a formula of their position (n), e.g., (n² + n) or (n² - n).", generate: () => { const startN = _rand(1, 5); const len = _rand(5, 6); const op = _rand(0, 1); const formula = (op === 0) ? "n² + n" : "n² - n"; const series = []; for (let i = 0; i < len; i++) { const n = startN + i; const val = (op === 0) ? (n * n + n) : (n * n - n); series.push(val); } const n_ans = startN + len; const answer = (op === 0) ? (n_ans * n_ans + n_ans) : (n_ans * n_ans - n_ans); const detail = `\nPattern is the formula ${formula}, starting from n=${startN}.\n(e.g. For n=${startN}, ${formula} = ${series[0]})`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Factorial-based", explanation: "Numbers are based on Factorials (n!) plus or minus a constant.", generate: () => { const fact_cache = [1, 1, 2, 6, 24, 120, 720, 5040]; let startN = _rand(1, 3); let len = _rand(4, 5); if (startN + len > 7) { len = 7 - startN; } const c = _rand(-5, 5); const series = []; for (let i = 0; i < len; i++) { const n = startN + i; series.push(fact_cache[n] + c); } const n_ans = startN + len; const answer = fact_cache[n_ans] + c; const c_str = (c > 0) ? `+ ${c}` : (c < 0) ? ` - ${-c}` : ""; const detail = `\nPattern is n! ${c_str}, starting from n=${startN}.\n(e.g. ${startN}! ${c_str} = ${series[0]})`; return { series, answer, detail }; } },
                { difficulty: "Medium", type: "Recursive Difference", explanation: "The difference between terms is another series in itself (e.g., Fibonacci or Geometric).", generate: () => { const type = _rand(0, 1); const len = _rand(5, 6); let s = _rand(5, 20); let series = [s]; let answer, detail; if (type === 0) { const d1 = _rand(1, 2); const d2 = _rand(d1 + 1, d1 + 2); let diff_series = [d1, d2]; for (let i = 2; i < len; i++) { diff_series.push(diff_series[i - 1] + diff_series[i - 2]); } for (let i = 0; i < len - 1; i++) { s += diff_series[i]; series.push(s); } answer = series[series.length - 1] + diff_series[len - 1]; detail = `\nThe difference between terms follows a Fibonacci pattern.\n(Pattern: +${diff_series[0]}, +${diff_series[1]}, +${diff_series[2]}, ...)`; } else { let current_diff = _rand(2, 4); const d_ratio = _rand(2, 3); let diff_series_str = []; for (let i = 0; i < len - 1; i++) { diff_series_str.push(current_diff); s += current_diff; series.push(s); current_diff *= d_ratio; } answer = series[series.length - 1] + current_diff; detail = `\nThe difference between terms follows a Geometric pattern (multiplying by ${d_ratio}).\n(Pattern: +${diff_series_str[0]}, +${diff_series_str[1]}, ...)`; } return { series, answer, detail }; } },
                { difficulty: "Medium", type: "General Knowledge", group: "lateral", explanation: "The numbers are the sequence of days in consecutive months.", generate: () => { const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; const startIdx = _rand(0, 11); const len = _rand(5, 6); const series = []; let detail = "\nBased on the number of days in a month. (e.g. "; for (let i = 0; i < len; i++) { const currentIdx = (startIdx + i) % 12; series.push(months[currentIdx]); if (i < 3) detail += `${months[currentIdx]}=${monthNames[currentIdx]}, `; } const answer = months[(startIdx + len) % 12]; detail += "...)" ; return { series, answer, detail }; } },
                { difficulty: "Medium", type: "Visual Pattern", group: "lateral", explanation: "The sequence follows a visual pattern on a standard number pad.", generate: () => { const patterns = [ { name: "columns left-to-right", p: [7, 4, 1, 8, 5, 2, 9, 6, 3] }, { name: "rows bottom-to-top", p: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, { name: "rows top-to-bottom", p: [7, 8, 9, 4, 5, 6, 1, 2, 3] }, { name: "a spiral in", p: [1, 2, 3, 6, 9, 8, 7, 4, 5] } ]; const chosen = patterns[_rand(0, patterns.length - 1)]; const len = _rand(5, 6); const series = chosen.p.slice(0, len); const answer = chosen.p[len]; const detail = `\nThe pattern follows a simple visual path on a numpad (e.g., ${chosen.name}).`; return { series, answer, detail }; } },
                { difficulty: "Medium", type: "Language Pattern", group: "lateral", explanation: "The number is the count of letters in the spelling of the *position* (e.g., 'One', 'Two', 'Three').", generate: () => { const letters = [3, 3, 5, 4, 4, 3, 5, 5, 4, 3, 6, 6]; const startN = _rand(0, 4); const len = _rand(5, 6); const series = letters.slice(startN, startN + len); const answer = letters[startN + len]; const detail = `\nThe sequence is the number of letters in the English spelling of the *position*.\n(e.g. 1st='One' (3), 2nd='Two' (3), 3rd='Three' (5), ...)`; return { series, answer, detail }; } },
                { difficulty: "Medium", type: "General Knowledge (Pi)", group: "lateral", explanation: "The numbers are the consecutive digits of Pi (3.14159...).", generate: () => { const pi = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]; const startIdx = _rand(0, pi.length - 8); const len = _rand(5, 6); const series = pi.slice(startIdx, startIdx + len); const answer = pi[startIdx + len]; const detail = `\nBased on the digits of Pi (3.14159...), starting from digit ${startIdx + 1}.`; return { series, answer, detail }; } },
                { difficulty: "Medium", type: "Language (Vowel Count)", group: "lateral", explanation: "The number is the count of vowels (A,E,I,O,U) in the spelling of the *position* (e.g., 'One', 'Two', 'Three').", generate: () => { const vowels = [2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 3, 1]; const startN = _rand(0, 4); const len = _rand(5, 6); const series = vowels.slice(startN, startN + len); const answer = vowels[startN + len]; const detail = `\nThe sequence is the number of vowels (A,E,I,O,U) in the English spelling of the *position*.\n(e.g. 1st='One' (O,E) -> 2, 2nd='Two' (O) -> 1, ...)`; return { series, answer, detail }; } },
                { difficulty: "Hard", type: "Math (Pythagorean)", group: "lateral", explanation: "The numbers are consecutive terms (a, b, c) of common Pythagorean triples (e.g., 3,4,5, 5,12,13...).", generate: () => { const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]; const flat_series = triples.flat(); const startIdx = _rand(0, 3); const len = _rand(5, 7); const series = flat_series.slice(startIdx, startIdx + len); const answer = flat_series[startIdx + len]; const detail = `\nBased on a flattened list of common Pythagorean triples (a, b, c).\n(e.g. ${triples[0].join(', ')}, ${triples[1].join(', ')}, ...)`; return { series, answer, detail }; } }
            ];

            // --- Step 1: Filter ALL special pools ---
            const lateral = principleLibrary.filter(p => p.group === 'lateral');
            const primeMedium = principleLibrary.filter(p => p.difficulty === 'Medium' && p.type === 'Prime');
            const primeHard = principleLibrary.filter(p => p.difficulty === 'Hard' && p.type === 'Prime');
            
            // --- Step 2: Filter main pools ---
            const easy = principleLibrary.filter(p => p.difficulty === 'Easy');
            const medium = principleLibrary.filter(p => p.difficulty === 'Medium' && p.group !== 'lateral' && p.type !== 'Prime');
            const hard = principleLibrary.filter(p => p.difficulty === 'Hard' && p.type !== 'Prime');
            
            // --- Step 3: Set base counts ---
            let counts = { eC: 12, mC: 10, hC: 3 }; // Medium default
            if (difficulty === 'easy') { counts = { eC: 18, mC: 7, hC: 0 }; } 
            else if (difficulty === 'hard') { counts = { eC: 5, mC: 12, hC: 8 }; }

            const selected = [];

            // --- Step 4: Steal slots & force-add special questions ---
            if (counts.mC > 0) counts.mC--; else if (counts.eC > 0) counts.eC--; else counts.hC--;
            selected.push(lateral[_rand(0, lateral.length - 1)]);
            
            if (difficulty === 'medium') {
                if (counts.mC > 0) counts.mC--; else if (counts.eC > 0) counts.eC--; 
                selected.push(primeMedium[_rand(0, primeMedium.length - 1)]);
            } else if (difficulty === 'hard') {
                if (counts.mC > 0) counts.mC--; else if (counts.eC > 0) counts.eC--; 
                selected.push(primeMedium[_rand(0, primeMedium.length - 1)]);
                if (counts.hC > 0) counts.hC--; else if (counts.mC > 0) counts.mC--; 
                selected.push(primeHard[_rand(0, primeHard.length - 1)]);
            }

            // --- Step 5: Populate standard questions ---
            for (let i = 0; i < counts.eC; i++) selected.push(easy[_rand(0, easy.length - 1)]);
            for (let i = 0; i < counts.mC; i++) selected.push(medium[_rand(0, medium.length - 1)]);
            for (let i = 0; i < counts.hC; i++) selected.push(hard[_rand(0, hard.length - 1)]);

            // --- Step 6: Generate Options and Shuffle ---
            shuffle(selected);
            const questions = selected.slice(0, 25).map((p, index) => {
                const { series, answer, detail } = p.generate();
                const options = new Set([answer]);
                let attempts = 0;
                while (options.size < 4 && attempts < 100) {
                    const range = Math.abs(answer) > 50 ? 15 : 8;
                    const diff = _rand(1, range) * (Math.random() > 0.5 ? 1 : -1);
                    if (diff !== 0) { const val = answer + diff; if (val > 0) options.add(val); }
                    attempts++;
                }
                while (options.size < 4) { options.add(answer + _rand(1, 10) + options.size); }
                const shuffledOptions = Array.from(options);
                shuffle(shuffledOptions);
                
                return {
                    id: index + 1,
                    text: series.join(', ') + ', ...?',
                    options: shuffledOptions,
                    correctAnswer: answer,
                    explanation: p.explanation + (detail || '')
                };
            });

            res.json({
                success: true,
                data: {
                    quizInfo: { timeLimit: 360, totalQuestions: 25 }, // 6 นาที
                    questions: questions
                }
            });

        } catch (error) {
            console.error("Error getSRNQuizData:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

// API 2: บันทึกคะแนน SRN (รองรับโหมด Practice/Test และระดับความยาก)
exports.submitSRNScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const data = req.body;
            const userEmail = data.email;
            
            if (!userEmail) return res.status(400).json({ success: false, message: 'Missing Email' });

            const score = Number(data.score) || 0;
            const total = Number(data.total) || 25;
            const timeSpent = Number(data.timeSpent) || 0; 
            const attempted = Number(data.attempted) || 0;
            const accuracy = attempted > 0 ? parseFloat(((score / attempted) * 100).toFixed(2)) : 0;
            const mode = data.mode || 'Test'; // Practice / Test
            const difficulty = data.difficulty || 'Medium';
            
            const normalizedEmail = normalizeGmail(userEmail);
            const setId = "SRN"; 

            const newScoreData = {
                Email: userEmail,
                NormalizedEmail: normalizedEmail,
                SetID: setId,
                TestType: mode.toLowerCase(),
                Difficulty: difficulty,
                CorrectCount: score,
                TotalQuestions: total,
                Accuracy: accuracy,
                TimeSpent: timeSpent,
                Timestamp: FieldValue.serverTimestamp()
            };

            // สร้าง Custom ID: เช่น SRN_test_hard_email หรือ SRN_practice_easy_email
            const customDocId = `SRN_${mode.toLowerCase()}_${difficulty.toLowerCase()}_${userEmail}`;
            const resultsRef = db.collection("Results");
            
            let isNewBest = false;
            let finalBestData = { ...newScoreData };

            const snapshot = await resultsRef.doc(customDocId).get();

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set(newScoreData);
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.CorrectCount) || 0;
                const oldTime = Number(oldData.TimeSpent) || Number.MAX_SAFE_INTEGER;
                
                // ให้คะแนนใหม่ดีกว่า หรือ (คะแนนเท่ากันแต่ใช้เวลาน้อยกว่า)
                if (score > oldScore || (score === oldScore && timeSpent < oldTime)) {
                    await resultsRef.doc(customDocId).set(newScoreData);
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

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            if (mode.toLowerCase() === 'test') {
                const allScoresSnapshot = await resultsRef
                    .where("SetID", "==", setId)
                    .where("TestType", "in", ["test", "Test"]) 
                    .where("Difficulty", "==", difficulty)
                    .get();

                const allOtherScores = [];
                
                allScoresSnapshot.forEach(doc => {
                    if (doc.id !== customDocId) {
                        allOtherScores.push(Number(doc.data().CorrectCount) || 0);
                    }
                });

                const targetScore = score;
                const bestScore = finalBestData.CorrectCount;
                
                // ใช้ oldScore จากด้านบนมาเป็น previousBestScore
                const snapshot = await resultsRef.doc(customDocId).get();
                let previousBestScore = null;
                if(snapshot.exists) {
                     previousBestScore = Number(snapshot.data().CorrectCount) || 0;
                }

                if (allOtherScores.length === 0) {
                    if (previousBestScore !== null) {
                        currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                        currentRank = targetScore >= previousBestScore ? 1 : 2;
                    } else {
                        currentPercentile = 100;
                        currentRank = 1;
                    }
                    bestPercentile = 100;
                    bestRank = 1;
                } else {
                    const countBeatCurrent = allOtherScores.filter(s => s < targetScore).length;
                    const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                    currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                    currentRank = countGreaterCurrent + 1;

                    const countBeatBest = allOtherScores.filter(s => s < bestScore).length;
                    const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                    bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                    bestRank = countGreaterBest + 1;
                }

                totalUsers = allOtherScores.length + 1;
            }

            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: score,
                    accuracy: accuracy,
                    timeSpent: timeSpent, 
                    attempted: attempted,
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

        } catch (error) {
            console.error("Error submitSRNScore:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
});

// ==========================================
// 15. STS (Short Term Memory - Symbols) LOGIC
// ==========================================

// API 1: ฟังก์ชันสร้างโจทย์ตารางสัญลักษณ์และคณิตศาสตร์ (ย้ายมาจาก Frontend เพื่อความปลอดภัย)
exports.getSTSQuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        try {
            const difficulty = (req.query.difficulty || 'normal').toLowerCase();

            const _rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = _rand(0, i);
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }

            // 1. สร้างข้อมูลสำหรับการจำ (Memorize Grid - 28 ตำแหน่ง)
            let memorizeData = [];
            if (difficulty === 'hard') {
                const cardSuits = ['♠', '♥', '♦', '♣'];
                const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
                const allCards = [];
                for (const suit of cardSuits) {
                    for (const value of cardValues) {
                        allCards.push({ value, suit });
                    }
                }
                shuffle(allCards);
                memorizeData = allCards.slice(0, 28);
            } else if (difficulty === 'hell') {
                const hellChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                while (memorizeData.length < 28) {
                    let s = '';
                    for (let i = 0; i < 3; i++) s += hellChars[Math.floor(Math.random() * hellChars.length)];
                    if (!memorizeData.includes(s)) memorizeData.push(s);
                }
            } else {
                const customSymbols = ['ABC', 'CBA', 'BAC', 'WPD', 'WDP', 'DPM', 'NOP', 'UYO', 'STG', 'NOK', 'Left', 'Right', 'O', '□', '∆', '123', '321', '789', '987', '198', '215', '531', '238', 'MKL', 'MLK', 'KLM', 'PQR', 'RQP'];
                shuffle(customSymbols);
                memorizeData = customSymbols.slice(0, 28);
            }

            // 2. สร้างตัวเลือก 4 ช้อยส์สำหรับโหมด Normal และ Hard
            let recallChoices = [];
            if (difficulty !== 'hell') {
                for (let i = 0; i < 28; i++) {
                    const correctAnswer = memorizeData[i];
                    const correctChoiceText = typeof correctAnswer === 'object' ? `${correctAnswer.value}${correctAnswer.suit}` : correctAnswer;
                    let choices = [correctChoiceText];
                    let attempts = 0;
                    while (choices.length < 4 && attempts < 100) {
                        const randomAnswer = memorizeData[Math.floor(Math.random() * 28)];
                        const randomChoiceText = typeof randomAnswer === 'object' ? `${randomAnswer.value}${randomAnswer.suit}` : randomAnswer;
                        if (!choices.includes(randomChoiceText)) choices.push(randomChoiceText);
                        attempts++;
                    }
                    shuffle(choices);
                    recallChoices[i] = choices;
                }
            }

            // 3. สร้างโจทย์คณิตศาสตร์คั่นเวลา 12 ข้อ
            const mathQuestions = [];
            for (let i = 0; i < 12; i++) {
                const num1 = _rand(10, 99);
                const num2 = _rand(10, 99);
                mathQuestions.push({ question: `${num1} × ${num2} = ?`, answer: num1 * num2 });
            }

            res.json({
                success: true,
                data: {
                    memorizeData: memorizeData,
                    mathQuestions: mathQuestions,
                    recallChoices: recallChoices, // ส่งตัวเลือกที่ถูกสุ่มแล้วจาก Server ไปให้หน้าเว็บ
                    quizInfo: { memorizeTime: 180, mathTime: 180, recallTime: 180 }
                }
            });

        } catch (error) {
            console.error("Error getSTSQuizData:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

// API 2: บันทึกคะแนน STS (รองรับโหมดและระดับความยาก)
exports.submitSTSScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const data = req.body;
            const userEmail = data.email;
            
            if (!userEmail) return res.status(400).json({ success: false, message: 'Missing Email' });

            const memoryScore = Number(data.memoryCorrectCount) || 0;
            const mathScore = Number(data.mathCorrectCount) || 0;
            const totalScore = Number(data.totalScore) || 0;
            const totalAttempted = Number(data.totalAttempted) || 0;
            const accuracy = totalAttempted > 0 ? parseFloat(((totalScore / totalAttempted) * 100).toFixed(2)) : 0;
            
            const timeSpent = Number(data.timeUsed) || 0; 
            const mode = data.mode || 'Test'; 
            const difficulty = data.difficulty || 'Normal';
            
            const normalizedEmail = userEmail.toLowerCase().trim();
            const setId = "STS"; 

            const newScoreData = {
                Email: userEmail,
                NormalizedEmail: normalizedEmail,
                SetID: setId,
                TestType: mode.toLowerCase(),
                Difficulty: difficulty.toLowerCase(),
                MemoryScore: memoryScore,
                MathScore: mathScore,
                CorrectCount: totalScore, 
                TotalQuestions: 40, // 28 Memory + 12 Math
                Accuracy: accuracy,
                TimeSpent: timeSpent,
                Timestamp: FieldValue.serverTimestamp()
            };

            // Custom ID format: STS_test_hard_email
            const customDocId = `STS_${mode.toLowerCase()}_${difficulty.toLowerCase()}_${normalizedEmail}`;
            const resultsRef = db.collection("Results");
            
            let isNewBest = false;
            let finalBestData = { ...newScoreData };

            const snapshot = await resultsRef.doc(customDocId).get();

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set(newScoreData);
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.CorrectCount) || 0;
                const oldTime = Number(oldData.TimeSpent) || Number.MAX_SAFE_INTEGER;
                
                if (totalScore > oldScore || (totalScore === oldScore && timeSpent < oldTime)) {
                    await resultsRef.doc(customDocId).set(newScoreData);
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

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            if (mode.toLowerCase() === 'test') {
                const allScoresSnapshot = await resultsRef
                    .where("SetID", "==", setId)
                    .where("TestType", "in", ["test", "Test"])
                    .where("Difficulty", "==", difficulty.toLowerCase())
                    .get();

                const allOtherScores = [];
                
                allScoresSnapshot.forEach(doc => {
                    if (doc.id !== customDocId) {
                        allOtherScores.push(Number(doc.data().CorrectCount) || 0);
                    }
                });

                const targetScore = totalScore;
                const bestScore = finalBestData.CorrectCount;
                
                // ใช้ oldScore จากด้านบนมาเป็น previousBestScore
                const snapshot = await resultsRef.doc(customDocId).get();
                let previousBestScore = null;
                if(snapshot.exists) {
                     previousBestScore = Number(snapshot.data().CorrectCount) || 0;
                }

                if (allOtherScores.length === 0) {
                    if (previousBestScore !== null) {
                        currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                        currentRank = targetScore >= previousBestScore ? 1 : 2;
                    } else {
                        currentPercentile = 100;
                        currentRank = 1;
                    }
                    bestPercentile = 100;
                    bestRank = 1;
                } else {
                    const countBeatCurrent = allOtherScores.filter(s => s < targetScore).length;
                    const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                    currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                    currentRank = countGreaterCurrent + 1;

                    const countBeatBest = allOtherScores.filter(s => s < bestScore).length;
                    const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                    bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                    bestRank = countGreaterBest + 1;
                }

                totalUsers = allOtherScores.length + 1;
            }

            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: totalScore,
                    accuracy: accuracy,
                    timeSpent: timeSpent, 
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

        } catch (error) {
            console.error("Error submitSTSScore:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
});

// ============================================================================
// Rubik3D 2016 (Monocolor Spatial Reasoning Test - Final)
// ============================================================================

// 1. ฟังก์ชันดึงพิกัดกลับเข้าศูนย์กลาง (แก้ให้เริ่มที่ 0 เพื่อให้ตรงกลางคือ 1 สมบูรณ์แบบ)
function normalizeShape2016(shape) {
    if (!shape || shape.length === 0) return [];
    let minX = Math.min(...shape.map(b => b.pos.x));
    let minY = Math.min(...shape.map(b => b.pos.y));
    let minZ = Math.min(...shape.map(b => b.pos.z));
    let normalized = shape.map(b => ({
        // ถอดการบวก 1 ทิ้งไป พิกัดจะเรียงเป็น 0, 1, 2 พอดีกับการหมุน CSS 3D
        pos: { x: b.pos.x - minX, y: b.pos.y - minY, z: b.pos.z - minZ },
        color: 'base'
    }));
    normalized.sort((a, b) => {
        if (a.pos.x !== b.pos.x) return a.pos.x - b.pos.x;
        if (a.pos.y !== b.pos.y) return a.pos.y - b.pos.y;
        return a.pos.z - b.pos.z;
    });
    return normalized;
}

function getAllOrientations2016(shape) {
    const ops = [
        (x,y,z)=>[x,y,z], (x,y,z)=>[x,-z,y], (x,y,z)=>[x,-y,-z], (x,y,z)=>[x,z,-y],
        (x,y,z)=>[-x,-y,z], (x,y,z)=>[-x,-z,-y], (x,y,z)=>[-x,y,-z], (x,y,z)=>[-x,z,y],
        (x,y,z)=>[y,-x,z], (x,y,z)=>[y,-z,-x], (x,y,z)=>[y,x,-z], (x,y,z)=>[y,z,x],
        (x,y,z)=>[-y,x,z], (x,y,z)=>[-y,-z,x], (x,y,z)=>[-y,-x,-z], (x,y,z)=>[-y,z,-x],
        (x,y,z)=>[z,y,-x], (x,y,z)=>[z,x,y], (x,y,z)=>[z,-y,x], (x,y,z)=>[z,-x,-y],
        (x,y,z)=>[-z,y,x], (x,y,z)=>[-z,-x,y], (x,y,z)=>[-z,-y,-x], (x,y,z)=>[-z,x,-y]
    ];
    return ops.map(op => shape.map(b => {
        let [nx, ny, nz] = op(b.pos.x, b.pos.y, b.pos.z);
        return { pos: {x: nx, y: ny, z: nz}, color: 'base' };
    })).map(normalizeShape2016);
}

function areShapesIdentical2016(shape1, shape2) {
    if (shape1.length !== shape2.length) return false;
    const s1Norm = JSON.stringify(normalizeShape2016(shape1));
    const s2Orientations = getAllOrientations2016(shape2);
    for (let s2 of s2Orientations) {
        if (s1Norm === JSON.stringify(s2)) return true;
    }
    return false;
}

function createMirroredShape2016(shape) {
    return shape.map(b => ({ pos: {x: -b.pos.x, y: b.pos.y, z: b.pos.z}, color: 'base' }));
}

function createShiftedShape2016(shape) {
    let newShape = JSON.parse(JSON.stringify(shape));
    if (newShape.length > 1) newShape.pop(); 
    
    let validPositions = [];
    let occupied = new Set(newShape.map(b => `${b.pos.x},${b.pos.y},${b.pos.z}`));
    let dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    
    for (let b of newShape) {
        for (let d of dirs) {
            let nx = b.pos.x+d[0], ny = b.pos.y+d[1], nz = b.pos.z+d[2];
            let posKey = `${nx},${ny},${nz}`;
            if (!occupied.has(posKey)) {
                validPositions.push({ pos: {x: nx, y: ny, z: nz}, color: 'base' });
            }
        }
    }
    
    if (validPositions.length > 0) {
        let newPos = validPositions[Math.floor(Math.random() * validPositions.length)];
        newShape.push(newPos);
    }
    return newShape;
}

// 2. ฟังก์ชันสร้าง Master Cube (แก้ให้สร้างบนแกน 0-2)
function generateFullCube2016() {
    let shape = [];
    // สร้างจาก 0 ถึง 2 ทำให้ศูนย์กลางตกอยู่ที่เลข 1 พอดี
    for (let x = 0; x <= 2; x++) {
        for (let y = 0; y <= 2; y++) {
            for (let z = 0; z <= 2; z++) {
                shape.push({ pos: {x, y, z}, color: 'base' });
            }
        }
    }
    return shape;
}

// 3. ฟังก์ชันสร้างโจทย์ทั้งหมด (เพิ่มการบังคับ Normalize ช้อยส์ก่อนส่ง)
function generateRubik3D2016Quiz(difficulty) {
    let questions = [];

    for (let i = 0; i < 15; i++) {
        let numParts = 2; 
        if (difficulty === 'hard') numParts = 3; 
        else if (difficulty === 'normal') numParts = Math.random() < 0.5 ? 2 : 3;

        let masterShape = generateFullCube2016();

        let coords = [];
        // แก้ไข: ลูปสุ่มจุดอ้างอิงให้เป็น 0 ถึง 2 ตาม Master Cube
        for (let x = 0; x <= 2; x++) {
            for (let y = 0; y <= 2; y++) {
                for (let z = 0; z <= 2; z++) {
                    coords.push({x, y, z});
                }
            }
        }
        coords.sort(() => Math.random() - 0.5);

        let parts = [];
        for (let j = 0; j < numParts; j++) parts.push([]);

        for (let j = 0; j < numParts; j++) {
            let seed = coords[j];
            parts[j].push({ pos: {x: seed.x, y: seed.y, z: seed.z}, color: 'base' });
        }

        let unassigned = coords.slice(numParts);

        while (unassigned.length > 0) {
            let progressed = false;
            let partIndices = Array.from({length: numParts}, (_, idx) => idx).sort(() => Math.random() - 0.5);
            
            for (let j of partIndices) {
                let adj = unassigned.filter(u => parts[j].some(p => 
                    Math.abs(u.x - p.pos.x) + Math.abs(u.y - p.pos.y) + Math.abs(u.z - p.pos.z) === 1
                ));
                
                if (adj.length > 0) {
                    let pick = adj[Math.floor(Math.random() * adj.length)];
                    parts[j].push({ pos: {x: pick.x, y: pick.y, z: pick.z}, color: 'base' });
                    unassigned = unassigned.filter(u => !(u.x === pick.x && u.y === pick.y && u.z === pick.z));
                    progressed = true;
                }
            }
            
            if (!progressed && unassigned.length > 0) {
                let u = unassigned.pop();
                parts[0].push({ pos: {x: u.x, y: u.y, z: u.z}, color: 'base' });
            }
        }

        let puzzlePieces = parts.slice(0, numParts - 1);
        let missingPiece = parts[numParts - 1]; 
        
        let distractors = [];
        distractors.push(createMirroredShape2016(missingPiece)); 
        
        let attempts = 0;
        while (distractors.length < 3) {
            attempts++;
            let newDistractor;
            if (attempts < 50) {
                newDistractor = createShiftedShape2016(missingPiece); 
            } else {
                newDistractor = createShiftedShape2016(distractors[distractors.length - 1]); 
            }
            
            if (!areShapesIdentical2016(newDistractor, missingPiece) && !distractors.some(d => areShapesIdentical2016(newDistractor, d))) {
                distractors.push(newDistractor);
            }
        }
        
        // จุดแก้บั๊ก 100%: นำช้อยส์ทั้งหมดมาบังคับ Center ให้อยู่ตรงกลางเป๊ะก่อนส่งให้ Client
        let choicesShapes = [missingPiece, ...distractors].map(shape => normalizeShape2016(shape));
        
        let correctIndex = 0;
        choicesShapes.sort(() => Math.random() - 0.5);
        
        let normalizedMissingPiece = normalizeShape2016(missingPiece);
        for(let c=0; c<choicesShapes.length; c++) {
            if(areShapesIdentical2016(choicesShapes[c], normalizedMissingPiece)) {
                correctIndex = c;
                break;
            }
        }

        questions.push({
            masterCube: masterShape,
            puzzlePieces: puzzlePieces,
            choices: choicesShapes,
            correctIndex: correctIndex
        });
    }
    return questions;
}

// API 1: ดึงข้อสอบ Rubik3D 2016
exports.getRubik3D2016QuizData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        try {
            const diff = req.query.difficulty || 'normal';
            const questions = generateRubik3D2016Quiz(diff);
            res.json({ success: true, data: questions });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

// API 2: บันทึกคะแนน (ใช้ชื่อ saveRubik3D2016Score ตรงกับ HTML)
exports.saveRubik3D2016Score = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const scoreData = req.body;
            const userEmail = scoreData.userEmail;
            if (!userEmail) throw new Error("User email missing.");

            const difficulty = scoreData.difficulty || 'normal';
            // ใช้โครงสร้าง SetID แบบเดียวกับระบบหลักของคุณ
            const setId = `RUBIK_3D_2016_${difficulty.toUpperCase()}`;
            const normalizedUserEmail = normalizeGmail(userEmail);

            const userAnswers = scoreData.userAnswers || [];
            const correctIndices = scoreData.correctIndices || [];

            let calculatedCorrectCount = 0;
            let answeredCount = 0;

            userAnswers.forEach((ans, index) => {
                if (ans !== null && ans !== undefined) {
                    answeredCount++;
                    if (ans === correctIndices[index]) {
                        calculatedCorrectCount++;
                    }
                }
            });

            const totalQuestions = scoreData.totalQuestions || 15;
            const currentAccuracy = answeredCount > 0 ? (calculatedCorrectCount / answeredCount) * 100 : 0;
            // คำนวณ Performance Score แบบเดียวกับระบบหลัก
            const performanceScore = (answeredCount > 0)
                ? (calculatedCorrectCount / totalQuestions) * (currentAccuracy)
                : 0;

            const resultsRef = db.collection("Results");
            const customDocId = `RUBIK_3D_2016_${difficulty}_${userEmail}`;
            
            let isNewBest = false;
            let finalBestData = { 
                PerformanceScore: performanceScore,
                CorrectCount: calculatedCorrectCount,
                Accuracy: currentAccuracy,
                TimeUsed: scoreData.timeUsed
            };

            // 1. ตรวจสอบคะแนนเก่า และเก็บ Previous Score ไว้
            const snapshot = await resultsRef.doc(customDocId).get();
            let previousBestScore = null; 

            if (!snapshot.exists) {
                await resultsRef.doc(customDocId).set({
                    Timestamp: new Date(),
                    UserEmail: userEmail,
                    NormalizedEmail: normalizedUserEmail,
                    SetID: setId,
                    CorrectCount: calculatedCorrectCount,
                    TotalQuestions: totalQuestions,
                    Accuracy: currentAccuracy,
                    TimeUsed: scoreData.timeUsed,
                    PerformanceScore: performanceScore,
                    Difficulty: difficulty
                });
                isNewBest = true;
            } else {
                const oldData = snapshot.data();
                const oldScore = Number(oldData.PerformanceScore) || 0;
                previousBestScore = oldScore; 
                
                // ใช้ Performance Score เป็นเกณฑ์หลักในการวัด
                if (performanceScore > oldScore) {
                    await resultsRef.doc(customDocId).set({
                        Timestamp: new Date(),
                        UserEmail: userEmail,
                        NormalizedEmail: normalizedUserEmail,
                        SetID: setId,
                        CorrectCount: calculatedCorrectCount,
                        TotalQuestions: totalQuestions,
                        Accuracy: currentAccuracy,
                        TimeUsed: scoreData.timeUsed,
                        PerformanceScore: performanceScore,
                        Difficulty: difficulty
                    });
                    isNewBest = true;
                } else {
                    finalBestData = {
                        PerformanceScore: oldScore,
                        CorrectCount: oldData.CorrectCount,
                        Accuracy: oldData.Accuracy,
                        TimeUsed: oldData.TimeUsed || 0
                    };
                    isNewBest = false;
                }
            }

            // 2. คำนวณ Percentile, Rank และ Total Users
            let currentPercentile = 0;
            let bestPercentile = 100;
            let currentRank = 1;
            let bestRank = 1;
            let totalUsers = 1;

            const allScoresSnapshot = await resultsRef.where("SetID", "==", setId).get();
            const allOtherScores = [];
            
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== customDocId) {
                    allOtherScores.push(Number(doc.data().PerformanceScore) || 0);
                }
            });

            const targetScore = performanceScore;
            const bestScore = finalBestData.PerformanceScore;

            if (allOtherScores.length === 0) {
                if (previousBestScore !== null) {
                    currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                    currentRank = targetScore >= previousBestScore ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
                bestPercentile = 100;
                bestRank = 1;
            } else {
                const countBeatCurrent = allOtherScores.filter(s => s <= targetScore).length;
                const countGreaterCurrent = allOtherScores.filter(s => s > targetScore).length; 
                currentPercentile = (countBeatCurrent / allOtherScores.length) * 100;
                currentRank = countGreaterCurrent + 1;

                const countBeatBest = allOtherScores.filter(s => s <= bestScore).length;
                const countGreaterBest = allOtherScores.filter(s => s > bestScore).length; 
                bestPercentile = (countBeatBest / allOtherScores.length) * 100;
                bestRank = countGreaterBest + 1;
            }

            totalUsers = allOtherScores.length + 1;

            // ส่งข้อมูลกลับตาม Format ใหม่
            res.json({
                success: true,
                isNewBest: isNewBest,
                current: {
                    score: calculatedCorrectCount,
                    accuracy: currentAccuracy,
                    timeSpent: scoreData.timeUsed, 
                    percentile: currentPercentile,
                    rank: String(currentRank),
                    totalUsers: String(totalUsers)
                },
                best: {
                    score: finalBestData.CorrectCount,
                    accuracy: finalBestData.Accuracy,
                    percentile: bestPercentile,
                    rank: String(bestRank),
                    totalUsers: String(totalUsers)
                }
            });

        } catch (e) {
            console.error("Error saveRubik3D2016Score:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// API 3: ดึงข้อมูลคะแนนที่ดีที่สุด (ใช้ชื่อ getBestRubik3D2016Score ตรงกับ HTML)
exports.getBestRubik3D2016Score = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userEmail = req.query.email;
            const difficulty = req.query.difficulty || 'normal';
            if (!userEmail) throw new Error("Missing email");

            const setId = `RUBIK_3D_2016_${difficulty.toUpperCase()}`;
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
            console.error("Error getBestRubik3D2016Score:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

// ============================================================================
// MOCKUP TEST SYSTEM (ระบบคุมสอบรวม)
// ============================================================================

exports.saveMockupScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const data = req.body;
            const userEmail = data.userEmail;
            const mockupType = data.mockupType; 
            
            if (!userEmail || !mockupType) {
                res.status(400).json({ success: false, message: "Missing email or mockupType." });
                return;
            }

            const normalizedUserEmail = userEmail.toLowerCase().replace(/\s+/g, '');
            const docId = `${mockupType}_${normalizedUserEmail}`; 
            const mockupResultsRef = db.collection("MockupResults").doc(docId);
            
            const cleanSubTestResults = {};
            if (data.subTestResults) {
                Object.keys(data.subTestResults).forEach(key => {
                    cleanSubTestResults[key] = {
                        correct: data.subTestResults[key].correct || 0,
                        total: data.subTestResults[key].total || 0,
                        accuracy: data.subTestResults[key].accuracy || 0,
                        timeUsed: data.subTestResults[key].timeUsed || 0,
                        weightedScore: data.subTestResults[key].weightedScore || 0
                    };
                });
            }

            const newResultDoc = {
                Timestamp: FieldValue.serverTimestamp(),
                UserEmail: userEmail,
                NormalizedEmail: normalizedUserEmail,
                MockupType: mockupType,
                TotalScore: data.totalScore || 0, 
                TotalTimeUsed: data.totalTimeUsed || 0,
                SubTestResults: cleanSubTestResults, 
            };

            const docSnap = await mockupResultsRef.get();
            let shouldSave = true;
            let previousBestScore = null; 

            if (docSnap.exists) {
                const existingData = docSnap.data();
                previousBestScore = existingData.TotalScore; 
                
                if (existingData.TotalScore > newResultDoc.TotalScore || 
                   (existingData.TotalScore === newResultDoc.TotalScore && existingData.TotalTimeUsed < newResultDoc.TotalTimeUsed)) {
                    shouldSave = false;
                }
            }

            if (shouldSave) {
                await mockupResultsRef.set(newResultDoc);
            }

            // ✅ คำนวณ Percentile, Rank และ Total Users
            const allScoresSnapshot = await db.collection("MockupResults").where("MockupType", "==", mockupType).get();
            const allOtherScores = [];
            
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== docId) { // ไม่เอาคะแนนที่เป็น Doc ของตัวเอง
                    allOtherScores.push(doc.data().TotalScore);
                }
            });

            const targetScore = data.totalScore;
            let currentPercentile = 0;
            let currentRank = 1;

            if (allOtherScores.length === 0) {
                if (previousBestScore !== null) {
                    currentPercentile = targetScore >= previousBestScore ? 100 : 0;
                    currentRank = targetScore >= previousBestScore ? 1 : 2;
                } else {
                    currentPercentile = 100;
                    currentRank = 1;
                }
            } else {
                const countBeat = allOtherScores.filter(s => s < targetScore).length;
                const countGreater = allOtherScores.filter(s => s > targetScore).length; // หาคนที่ได้มากกว่าเพื่อคิด Rank
                
                currentPercentile = (countBeat / allOtherScores.length) * 100;
                currentRank = countGreater + 1;
            }

            const totalUsers = allOtherScores.length + 1; // รวมตัวเองเข้าไปด้วย

            res.json({ 
                success: true, 
                percentile: Math.round(currentPercentile), 
                rank: currentRank,
                totalUsers: totalUsers,
                isBestScoreUpdated: shouldSave 
            });

        } catch (e) {
            console.error("Error saveMockupScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});

exports.getBestMockupScore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userEmail = req.query.email;
            const mockupType = req.query.mockupType;
            if (!userEmail || !mockupType) {
                res.status(400).json({ success: false, message: "Missing email or mockupType" });
                return;
            }

            const normalizedUserEmail = userEmail.toLowerCase().replace(/\s+/g, '');
            const docId = `${mockupType}_${normalizedUserEmail}`; 
            
            const docSnap = await db.collection("MockupResults").doc(docId).get();

            if (!docSnap.exists) {
                res.json({ success: true, data: null });
                return;
            }

            const bestRow = docSnap.data();
            const allScoresSnapshot = await db.collection("MockupResults").where("MockupType", "==", mockupType).get();
            
            const allOtherScores = [];
            allScoresSnapshot.forEach(doc => {
                if (doc.id !== docId) {
                    allOtherScores.push(doc.data().TotalScore);
                }
            });

            let bestPercentile = 100;
            let bestRank = 1;
            const totalUsers = allOtherScores.length + 1;

            if (allOtherScores.length > 0) {
                const countBeat = allOtherScores.filter(s => s < bestRow.TotalScore).length;
                const countGreater = allOtherScores.filter(s => s > bestRow.TotalScore).length;
                
                bestPercentile = (countBeat / allOtherScores.length) * 100;
                bestRank = countGreater + 1;
            }

            res.json({ 
                success: true, 
                data: {
                    bestScore: bestRow.TotalScore,
                    totalQuestions: 100, 
                    bestPercentile: Math.round(bestPercentile),
                    bestRank: bestRank,
                    totalUsers: totalUsers,
                    subTestResults: bestRow.SubTestResults || {} 
                } 
            });
        } catch (e) {
            console.error("Error getBestMockupScore:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    });
});