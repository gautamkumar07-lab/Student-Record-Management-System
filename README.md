# Student Record Management System using Arrays, Searching, and Sorting Algorithms

A DSA mini-project built with HTML, CSS and JavaScript. Records live in a JavaScript array and are saved in the browser's localStorage.

## Run
Open `index.html` in any modern browser. No installation needed.

## Structure
- `index.html` - layout and components
- `css/style.css` - glassmorphism, 3D effects, animations, responsive rules
- `js/script.js` - array storage, CRUD, Linear/Binary Search, Bubble/Quick Sort, statistics

## Algorithms
| Algorithm | Best | Average | Worst | Space |
|---|---|---|---|---|
| Linear Search | O(1) | O(n) | O(n) | O(1) |
| Binary Search | O(1) | O(log n) | O(log n) | O(1) |
| Bubble Sort | O(n) | O(n^2) | O(n^2) | O(1) |
| Quick Sort | O(n log n) | O(n log n) | O(n^2) | O(log n) |

Binary Search needs sorted data, so the app sorts a copy by the chosen field (Quick Sort) before searching. It matches exactly; Linear Search matches names partially.
