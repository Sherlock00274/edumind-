import { Card, Quiz } from '../types';

export const CARDS_DATA: Card[] = [
  { 
    id: 1, 
    chapter: "CSIT 5900 > Uninformed Search", 
    conceptEn: "BFS vs DFS", 
    conceptZh: "广度优先与深度优先搜索", 
    description: "BFS 逐层扩展，保证找到最优解，但空间复杂度极高(b^d)。DFS 深入单一分支，空间复杂度低(bm)，不保证最优解。", 
    source: "Lecture 3, Slide 13", 
    errorCount: 4, 
    inlineQuiz: { 
      question: "在树的深度为d、分支因子为b的情况下，哪种算法空间复杂度极高？", 
      options: [{ id: 'A', text: 'BFS' }, { id: 'B', text: 'DFS' }], 
      correctAnswer: 'A' 
    } 
  },
  { 
    id: 2, 
    chapter: "CSIT 5900 > Heuristic Search", 
    conceptEn: "A* Search", 
    conceptZh: "A* 搜索算法", 
    description: "评估函数 f(n) = g(n) + h(n)。只要启发式函数 h(n) 具有可采纳性（即从不高估实际代价），A* 就能保证找到最优解。", 
    source: "Lecture 3, Slide 19 & 25", 
    errorCount: 12, 
    inlineQuiz: { 
      question: "A*算法找到最优解的前提是，h(n) 必须满足什么特性？", 
      options: [{ id: 'A', text: '必须大于实际代价' }, { id: 'B', text: '必须具有可采纳性' }, { id: 'C', text: '必须等于零' }], 
      correctAnswer: 'B' 
    } 
  },
  { 
    id: 3, 
    chapter: "CSIT 5900 > Hill Climbing", 
    conceptEn: "Simulated Annealing", 
    conceptZh: "模拟退火算法", 
    description: "为跳出爬山算法的“局部最优”，模拟退火会以一定概率接受更差的移动，且该概率随时间推移逐渐降低（冷却）。", 
    source: "Lecture 3, Slide 33", 
    errorCount: 8, 
    inlineQuiz: { 
      question: "模拟退火算法是如何尝试跳出“局部最优”的？", 
      options: [{ id: 'A', text: '总是选择当前最优的移动' }, { id: 'B', text: '以一定概率接受较差的移动' }], 
      correctAnswer: 'B' 
    } 
  },
  { 
    id: 4, 
    chapter: "CSIT 5900 > Uninformed Search", 
    conceptEn: "Iterative Deepening", 
    conceptZh: "迭代加深搜索 (IDS)", 
    description: "结合了 DFS 的线性内存需求和 BFS 的最优性保证。通过逐步增加深度限制来进行连续的深度优先搜索。", 
    source: "Lecture 3, Slide 14", 
    errorCount: 2, 
    inlineQuiz: { 
      question: "哪种算法结合了 DFS 的线性内存优势和 BFS 的最优性保证？", 
      options: [{ id: 'A', text: 'IDS' }, { id: 'B', text: 'A* 搜索' }], 
      correctAnswer: 'A' 
    } 
  },
  { 
    id: 5, 
    chapter: "CSIT 5900 > Heuristic Search", 
    conceptEn: "Dominant Heuristic", 
    conceptZh: "占优启发式函数", 
    description: "在可采纳的前提下，具有更高评估值的启发式函数（如 h2 >= h1）被称为占优函数，扩展更少的节点。", 
    source: "Lecture 3, Slide 27", 
    errorCount: 7, 
    inlineQuiz: { 
      question: "如果 h2(n) >= h1(n) 且都可采纳，h2 对 h1 具有什么性质？", 
      options: [{ id: 'A', text: '占优 (Dominance)' }, { id: 'B', text: '等效 (Equivalence)' }], 
      correctAnswer: 'A' 
    } 
  },
  { 
    id: 6, 
    chapter: "CSIT 5900 > Formulating Problems", 
    conceptEn: "Search Formulation", 
    conceptZh: "搜索问题建模", 
    description: "一个搜索问题包含：初始状态 (Initial State)、确定性动作集合 (Actions)、目标测试 (Goal Test) 以及路径代价 (Path Cost)。", 
    source: "Lecture 3, Slide 5", 
    errorCount: 1, 
    inlineQuiz: { 
      question: "以下哪项不是标准搜索问题建模的必须组成部分？", 
      options: [{ id: 'A', text: '路径代价 (Path Cost)' }, { id: 'B', text: '启发式函数 (Heuristic)' }, { id: 'C', text: '目标测试 (Goal Test)' }], 
      correctAnswer: 'B' 
    } 
  }
];

export const QUIZZES_DATA: Quiz[] = [
  { 
    question: "根据 A* 搜索算法的原理，若要保证系统最终一定能找到最优解，启发式函数 h(n) 必须满足什么条件？", 
    options: [ 
      { id: 'A', text: "h(n) 必须大于实际的最小代价" }, 
      { id: 'B', text: "h(n) 必须具有可采纳性 (Admissible)，即从不高估代价" }, 
      { id: 'C', text: "h(n) 的值必须随着搜索深度呈指数级衰减" } 
    ], 
    correctAnswer: 'B' 
  },
  { 
    question: "哪种搜索算法结合了深度优先搜索 (DFS) 的线性内存优势，并在有解的情况下保证能找到最优解？", 
    options: [ 
      { id: 'A', text: "Breadth-First Search (广度优先)" }, 
      { id: 'B', text: "Iterative Deepening Search (迭代加深)" }, 
      { id: 'C', text: "Simulated Annealing (模拟退火)" } 
    ], 
    correctAnswer: 'B' 
  }
];
