/** @param {import("..").NS} ns */
export const solvers = {};

solvers["Find Largest Prime Factor"] = (data) => {
	// Given a number, find its largest prime factor. A prime factor
	// is a factor that is a prime number.

	let num = data;
	let largestPrime = 1;
	for (let i = 2; i <= num; i++) {
		while (num % i === 0) {
			largestPrime = i;
			num = num / i;
		}
	}
	return largestPrime;
};

solvers["Subarray with Maximum Sum"] = (data) => {
	// Given an array of integers, find the contiguous subarray (containing
	// at least one number) which has the largest sum and return that sum.

	let currentMax = 0;
	let maxEndingHere = 0;

	for (let i = 0; i < data.length; i++) {
		maxEndingHere = maxEndingHere + data[i];
		if (currentMax < maxEndingHere) {
			currentMax = maxEndingHere;
		}
		if (maxEndingHere < 0) {
			maxEndingHere = 0;
		}
	}
	return currentMax;
};

solvers["Total Ways to Sum"] = (data) => {
	// Given a number, how many different distinct ways can that number be written as
	// a sum of at least two positive integers?

	let dataArray = Array(data + 1).fill(0);
	dataArray[0] = 1; // There is 1 way to partition 0

	for (let i = 1; i <= data; i++) {
		for (let j = i; j <= data; j++) {
			dataArray[j] += dataArray[j - i];
		}
	}

	return dataArray[data] - 1; // Subtract 1 because we don't count n as a sum of itself
};

solvers["Total Ways to Sum II"] = (data) => {
	// You are given an array with two elements. The first element is an integer n.
	// The second element is an array of numbers representing the set of available integers.
	// How many different distinct ways can that number n be written as
	// a sum of integers contained in the given set?
	// You may use each integer in the set zero or more times.

	let n = data[0];
	let availableIntegers = data[1];
	let ways = Array(n + 1).fill(0);

	ways[0] = 1;

	for (let i = 0; i < availableIntegers.length; i++) {
		for (let j = availableIntegers[i]; j <= n; j++) {
			ways[j] += ways[j - availableIntegers[i]];
		}
	}
	return ways[n];
};

solvers["Spiralize Matrix"] = (data) => {
	// Given an array of array of numbers representing a 2D matrix, return the
	// elements of that matrix in clockwise spiral order.
	//
	// Example: The spiral order of
	//
	// [1, 2, 3, 4]
	// [5, 6, 7, 8]
	// [9, 10, 11, 12]
	//
	// is [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]

	let result = [];

	let top = 0;
	let bottom = data.length - 1;
	let left = 0;
	let right = data[0].length - 1;

	while (top <= bottom && left <= right) {
		for (let i = left; i <= right; i++) {
			result.push(data[top][i]);
		}
		top++;

		for (let i = top; i <= bottom; i++) {
			result.push(data[i][right]);
		}
		right--;

		if (top <= bottom) {
			for (let i = right; i >= left; i--) {
				result.push(data[bottom][i]);
			}
			bottom--;
		}

		if (left <= right) {
			for (let i = bottom; i >= top; i--) {
				result.push(data[i][left]);
			}
			left++;
		}
	}

	return result;
};

solvers["Array Jumping Game"] = (data) => {
    // You are given an array of integers where each element represents the
    // maximum possible jump distance from that position. For example, if you
    // are at position i and your maximum jump length is n, then you can jump
    // to any position from i to i+n.
    
    // Assuming you are initially positioned at the start of the array, determine
    // whether you are able to reach the last index of the array.
    
    let maxDistance = 0;
    for (let i = 0; i < data.length; i++) {
        if (i > maxDistance) {
            return 0;
        }
        maxDistance = Math.max(maxDistance, i + data[i]);
    }
    return 1;
    
};

solvers["Array Jumping Game II"] = (data) => {
	// You are given an array of integers where each element represents the
	// maximum possible jump distance from that position. For example, if you
	// are at position i and your maximum jump length is n, then you can jump
	// to any position from i to i+n.

	// Assuming you are initially positioned at the start of the array, determine
	// the minimum number of jumps to reach the end of the array.

	// If it’s impossible to reach the end, then the answer should be 0.
	if (data.length <= 1) return 0;
    if (data[0] === 0) return 0;
    let maxDistance = data[0];
    let steps = data[0];

    let jumps = 1;

    for (let i = 1; i <= data.length;i++) {
        if (i === data.length -1) return jumps;
        maxDistance = Math.max(maxDistance,i + data[i])
        steps--
        if (steps === 0) {
            jumps++
            if (i >= maxDistance) return 0;
            steps = maxDistance - i
        }


    }
    return 0;
};

solvers["Merge Overlapping Intervals"] = (data) => {
	// Given an array of intervals, merge all overlapping intervals. An interval
	// is an array with two numbers, where the first number is always less than
	// the second (e.g. [1, 5]).
	//
	// The intervals must be returned in ASCENDING order.
	//
	// Example:
	// [[1, 3], [8, 10], [2, 6], [10, 16]]
	// merges into [[1, 6], [8, 16]]

    data.sort((a, b) => a[0] - b[0]);
    let merged = [data[0]];
    for (let i = 1; i < data.length; i++) {
        let last = merged[merged.length - 1];
        if(data[i][0] > last[1]) {
            merged.push(data[i]);
        } else {
            last[1] = Math.max(last[1], data[i][1]);
        }
    }
    return merged;
};

solvers["Generate IP Addresses"] = (data) => {
	// Given a string containing only digits, return an array with all possible
	// valid IP address combinations that can be created from the string.
	//
	// An octet in the IP address cannot begin with ‘0’ unless the number itself
	// is actually 0. For example, “192.168.010.1” is NOT a valid IP.
	//
	// Examples:
	// 25525511135 -> [255.255.11.135, 255.255.111.35]
	// 1938718066 -> [193.87.180.66]

	let result = [];

	for (let a = 1; a < 4; a++) {
        for (let b = 1; b < 4; b++) {
            for (let c = 1; c < 4; c++) {
                for (let d = 1; d < 4; d++) {
                    if (a + b + c + d === data.length) {
                        let A = data.slice(0, a);
                        let B = data.slice(a, a + b);
                        let C = data.slice(a + b, a + b + c);
                        let D = data.slice(a + b + c);

                        if (A[0] === 0 && A.length > 1 || B[0] === 0 && B.length > 1 || C[0] === 0 && C.length > 1 || D[0] === 0 && D.length > 1) continue;
                        if (A <= 255 && B <= 255 && C <= 255 && D <= 255) result.push(`${A}.${B}.${C}.${D}`);
                    }
                }
            }
        }
	}
	return result;
};

solvers["Algorithmic Stock Trader I"] = (data) => {
	// You are given an array of numbers representing stock prices, where the
	// i-th element represents the stock price on day i.
	//
	// Determine the maximum possible profit you can earn using at most one
	// transaction (i.e. you can buy an sell the stock once). If no profit
	// can be made, then the answer should be 0. Note that you must buy the stock
	// before you can sell it.
    let minPrice = data[0];
    let maxProfit = 0;
    for (let i = 1; i < data.length; i++) {
        if (data[i] < minPrice) {
            minPrice = data[i];
        } else if (data[i] - minPrice > maxProfit) {
            maxProfit = data[i] - minPrice;
        }
    }
    return maxProfit;
};

solvers["Algorithmic Stock Trader II"] = (data) => {
	// You are given an array of numbers representing stock prices, where the
	// i-th element represents the stock price on day i.
	//
	// Determine the maximum possible profit you can earn using as many transactions
	// as you’d like. A transaction is defined as buying and then selling one
	// share of the stock. Note that you cannot engage in multiple transactions at
	// once. In other words, you must sell the stock before you buy it again. If no
	// profit can be made, then the answer should be 0.

	let maxProfit = 0;  

    for (let i = 1; i < data.length; i++) {
        if (data[i] > data[i - 1]) {
            maxProfit += data[i] - data[i - 1];
        }
    }

    return maxProfit;
};

solvers["Algorithmic Stock Trader III"] = (data) => {
	// You are given an array of numbers representing stock prices, where the
	// i-th element represents the stock price on day i.
	//
	// Determine the maximum possible profit you can earn using at most two
	// transactions. A transaction is defined as buying and then selling one share
	// of the stock. Note that you cannot engage in multiple transactions at once.
	// In other words, you must sell the stock before you buy it again. If no profit
	// can be made, then the answer should be 0.

    let firstBuy = new Array(data.length).fill(0);
    let secondBuy = new Array(data.length).fill(0);
    firstBuy[0] = -data[0];
    secondBuy[0] = -data[0];
    let firstSell = 0, secondSell = 0;

    for (let i = 1; i < data.length; i++) {
        firstBuy[i] = Math.max(firstBuy[i - 1], -data[i]);
        firstSell = Math.max(firstSell, firstBuy[i - 1] + data[i]);
        secondBuy[i] = Math.max(secondBuy[i - 1], firstSell - data[i]);
        secondSell = Math.max(secondSell, secondBuy[i - 1] + data[i]);
    }

    return secondSell;
};

solvers["Algorithmic Stock Trader IV"] = (data) => {
	// You are given an array of numbers representing stock prices, where the
	// i-th element represents the stock price on day i.
	//
	// Determine the maximum possible profit you can earn using at most k
	// transactions. A transaction is defined as buying and then selling one share
	// of the stock. Note that you cannot engage in multiple transactions at once.
	// In other words, you must sell the stock before you buy it again. If no profit
	// can be made, then the answer should be 0.

	return "Not implemented";
};

solvers["Minimum Path Sum in a Triangle"] = (data) => {
	// You are given a 2D array of numbers (array of array of numbers) that represents a
	// triangle (the first array has one element, and each array has one more element than
	// the one before it, forming a triangle). Find the minimum path sum from the top to the
	// bottom of the triangle. In each step of the path, you may only move to adjacent
	// numbers in the row below.

	let distanceArray = Array.from({ length: data.length }, () => Array(data.length).fill(0));
    distanceArray[0][0] = data[0][0];

    for (let i = 1; i < data.length; i++) {
        for (let j = 0; j <= i; j++) {
            if (j == 0) {
                distanceArray[i][j] = distanceArray[i - 1][j] + data[i][j];
            } else if (j == i) {
                distanceArray[i][j] = distanceArray[i - 1][j - 1] + data[i][j];
            } else {
                distanceArray[i][j] = Math.min(distanceArray[i - 1][j - 1], distanceArray[i - 1][j]) + data[i][j];
            }
        }
    }

    return Math.min(...distanceArray[data.length - 1]);

};

solvers["Unique Paths in a Grid I"] = (data) => {
	// You are given an array with two numbers: [m, n]. These numbers represent a
	// m x n grid. Assume you are initially positioned in the top-left corner of that
	// grid and that you are trying to reach the bottom-right corner. On each step,
	// you may only move down or to the right.
	//
	//
	// Determine how many unique paths there are from start to finish.
    let m = data[0];
    let n = data[1];
	let distanceArray = Array(m).fill().map(() => Array(n).fill(0));

    distanceArray[0][0] = 1;

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== 0 || j !== 0) {
                if (i > 0 && j > 0) {
                    distanceArray[i][j] = distanceArray[i - 1][j] + distanceArray[i][j - 1];
                } else if (i > 0) {
                    distanceArray[i][j] = distanceArray[i - 1][j];
                } else if (j > 0) {
                    distanceArray[i][j] = distanceArray[i][j - 1];
                }
            }
        }
    }

    return distanceArray[m - 1][n - 1];
};

solvers["Unique Paths in a Grid II"] = (data) => {
	// You are given a 2D array of numbers (array of array of numbers) representing
	// a grid. The 2D array contains 1’s and 0’s, where 1 represents an obstacle and
	// 0 represents a free space.
	//
	// Assume you are initially positioned in top-left corner of that grid and that you
	// are trying to reach the bottom-right corner. In each step, you may only move down
	// or to the right. Furthermore, you cannot move onto spaces which have obstacles.
	//
	// Determine how many unique paths there are from start to finish.



    let m = data.length;
    let n = data[0].length;
	let distanceArray = Array(m).fill().map(() => Array(n).fill(0));

    if (data[0][0] === 1 || data[m - 1][n - 1] === 1) return 0;
    
    distanceArray[0][0] = 1;

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== 0 || j !== 0 && data[i][j] !== 1) {
                if (i > 0 && j > 0) {
                    distanceArray[i][j] = distanceArray[i - 1][j] + distanceArray[i][j - 1];
                } else if (i > 0) {
                    distanceArray[i][j] = distanceArray[i - 1][j];
                } else if (j > 0) {
                    distanceArray[i][j] = distanceArray[i][j - 1];
                }
            }
        }
    }

    return distanceArray[m - 1][n - 1];
};

solvers["Shortest Path in a Grid"] = (data) => {
	// You are given a 2D array of numbers (array of array of numbers) representing
	// a grid. The 2D array contains 1’s and 0’s, where 1 represents an obstacle and
	// 0 represents a free space.
	//
	// Assume you are initially positioned in top-left corner of that grid and that you
	// are trying to reach the bottom-right corner. In each step, you may move to the up,
	// down, left or right. Furthermore, you cannot move onto spaces which have obstacles.
	//
	// Determine if paths exist from start to destination, and find the shortest one.
	//
	// Examples:
	// [[0,1,0,0,0],
	// [0,0,0,1,0]] -> “DRRURRD”
	// [[0,1],
	// [1,0]] -> “”

	return "Not implemented";
};

solvers["Sanitize Parentheses in Expression"] = (data) => {
	// Given a string with parentheses and letters, remove the minimum number of invalid
	// parentheses in order to validate the string. If there are multiple minimal ways
	// to validate the string, provide all of the possible results.
	//
	// The answer should be provided as an array of strings. If it is impossible to validate
	// the string, the result should be an array with only an empty string.
	//
	// Examples:
	// ()())() -> [()()(), (())()]
	// (a)())() -> [(a)()(), (a())()]
	// )( -> [“”]

	return "Not implemented";
};

solvers["Find All Valid Math Expressions"] = (data) => {
	// You are given a string which contains only digits between 0 and 9 as well as a target
	// number. Return all possible ways you can add the +, -, and * operators to the string
	// of digits such that it evaluates to the target number.
	//
	// The answer should be provided as an array of strings containing the valid expressions.
	//
	// NOTE: Numbers in an expression cannot have leading 0’s
	// NOTE: The order of evaluation expects script operator precedence
	//
	// Examples:
	// Input: digits = “123”, target = 6
	// Output: [1+2+3, 1*2*3]
	//
	// Input: digits = “105”, target = 5
	// Output: [1*0+5, 10-5]

	return "Not implemented";
};

solvers["HammingCodes: Integer to Encoded Binary"] = (data) => {
	// You are given a decimal value.
	// Convert it into a binary string and encode it as a ‘Hamming-Code’. eg:
	// Value 8 will result into binary ‘1000’, which will be encoded
	// with the pattern ‘pppdistanceArrayddd’, where p is a paritybit and d a databit,
	// or ‘10101’ (Value 21) will result into (pppdistanceArraydddistanceArrayd) ‘1001101011’.
	// NOTE: You need an parity Bit on Index 0 as an ‘overall’-paritybit.
	// NOTE 2: You should watch the HammingCode-video from 3Blue1Brown, which
	// explains the ‘rule’ of encoding,
	// including the first Index parity-bit mentioned on the first note.
	// Now the only one rule for this encoding:
	// It’s not allowed to add additional leading ‘0’s to the binary value
	// That means, the binary value has to be encoded as it is

	return "Not implemented";
};

solvers["HammingCodes: Encoded Binary to Integer"] = (data) => {
	// You are given an encoded binary string.
	// Treat it as a Hammingcode with 1 ‘possible’ error on an random Index.
	// Find the ‘possible’ wrong bit, fix it and extract the decimal value, which is
	// hidden inside the string.nn”,
	// Note: The length of the binary string is dynamic, but it’s encoding/decoding is
	// following Hammings ‘rule’n”,
	// Note 2: Index 0 is an ‘overall’ parity bit. Watch the Hammingcode-video from
	// 3Blue1Brown for more information”,
	// Note 3: There’s a ~55% chance for an altered Bit. So… MAYBE
	// there is an altered Bit 😉n”,
	// Extra note for automation: return the decimal value as a string”,

	return "Not implemented";
};

solvers["Proper 2-Coloring of a Graph"] = (data) => {
	// You are given data, representing a graph. Note that “graph”, as used here, refers to
	// the field of graph theory, and has no relation to statistics or plotting.
	//
	// The first element of the data represents the number of vertices in the graph. Each
	// vertex is a unique number between 0 and ${data[0] - 1}. The next element of the data
	// represents the edges of the graph.
	//
	// Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v].
	// Note that an edge [u,v] is the same as an edge [v,u], as order does not matter.
	//
	// You must construct a 2-coloring of the graph, meaning that you have to assign each
	// vertex in the graph a “color”, either 0 or 1, such that no two adjacent vertices have
	// the same color. Submit your answer in the form of an array, where element i
	// represents the color of vertex i. If it is impossible to construct a 2-coloring of
	// the given graph, instead submit an empty array.
	//
	// Examples:
	//
	// Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
	// Output: [0, 0, 1, 1]
	//
	// Input: [3, [[0, 1], [0, 2], [1, 2]]]
	// Output: []

	return "Not implemented";
};

solvers["Compression I: RLE Compression"] = (data) => {
	// Run-length encoding (RLE) is a data compression technique which encodes data as a
	// series of runs of a repeated single character. Runs are encoded as a length, followed
	// by the character itself. Lengths are encoded as a single ASCII digit; runs of 10
	// characters or more are encoded by splitting them into multiple runs.
	//
	// You are given a string as input. Encode it using run-length encoding with the minimum
	// possible output length.
	//
	// Examples:
	// aaaaabccc -> 5a1b3c
	// aAaAaA -> 1a1A1a1A1a1A
	// 111112333 -> 511233
	// zzzzzzzzzzzzzzzzzzz -> 9z9z1z (or 9z8z2z, etc.)

	return "Not implemented";
};

solvers["Compression II: LZ Decompression"] = (data) => {
	// Lempel-Ziv (LZ) compression is a data compression technique which encodes data using
	// references to earlier parts of the data. In this variant of LZ, data is encoded in two
	// types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit
	// from 1 - 9, followed by the chunk data, which is either:

	// 1. Exactly L characters, which are to be copied directly into the uncompressed data.
	// 2. A reference to an earlier part of the uncompressed data. To do this, the length
	// is followed by a second ASCII digit X: each of the L output characters is a copy
	// of the character X places before it in the uncompressed data.

	// For both chunk types, a length of 0 instead means the chunk ends immediately, and the
	// next character is the start of a new chunk. The two chunk types alternate, starting
	// with type 1, and the final chunk may be of either type.

	// You are given an LZ-encoded string. Decode it and output the original string.

	// Example: decoding ‘5aaabb450723abb’ chunk-by-chunk
	// 5aaabb -> aaabb
	// 5aaabb45 -> aaabbaaab
	// 5aaabb450 -> aaabbaaab
	// 5aaabb45072 -> aaabbaaababababa
	// 5aaabb450723abb -> aaabbaaababababaabb

	return "Not implemented";
};

solvers["Compression III: LZ Compression"] = (data) => {
	// Lempel-Ziv (LZ) compression is a data compression technique which encodes data using
	// references to earlier parts of the data. In this variant of LZ, data is encoded in two
	// types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit
	// from 1 - 9, followed by the chunk data, which is either:

	// 1. Exactly L characters, which are to be copied directly into the uncompressed data.
	// 2. A reference to an earlier part of the uncompressed data. To do this, the length
	// is followed by a second ASCII digit X: each of the L output characters is a copy
	// of the character X places before it in the uncompressed data.

	// For both chunk types, a length of 0 instead means the chunk ends immediately, and the
	// next character is the start of a new chunk. The two chunk types alternate, starting
	// with type 1, and the final chunk may be of either type.

	// You are given a string as input. Encode it using Lempel-Ziv encoding with the minimum
	// possible output length.

	// Examples (some have other possible encodings of minimal length):
	// abracadabra -> 7abracad47
	// mississippi -> 4miss433ppi
	// aAAaAAaAaAA -> 3aAA53035
	// 2718281828 -> 627182844
	// abcdefghijk -> 9abcdefghi02jk
	// aaaaaaaaaaaa -> 3aaa91
	// aaaaaaaaaaaaa -> 1a91031
	// aaaaaaaaaaaaaa -> 1a91041

	return "Not implemented";
};

solvers["Encryption I: Caesar Cipher"] = (data) => {
	// Caesar cipher is one of the simplest encryption techniques. It is a type of
	// substitution cipher in which each letter in the plaintext is replaced by a letter some
	// fixed number of positions down the alphabet. For example, with a left shift of 3, D
	// would be replaced by A, E would become B, and A would become X (because of rotation).
	// You are given an array with two elements. The first element is the plaintext, the
	// second element is the left shift value. Return the ciphertext as uppercase string.
	// Spaces remains the same.

	return "Not implemented";
};

solvers["Encryption II: Vigenère Cipher"] = (data) => {
	// Vigenère cipher is a type of polyalphabetic substitution. It uses the Vigenère square
	// to encrypt and decrypt plaintext with a keyword.
	// Vigenère square:
	// A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
	// +—————————————————-
	// A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
	// B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
	// C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
	// D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
	// E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D
	// …
	// Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X
	// Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y
	// For encryption each letter of the plaintext is paired with the corresponding letter of
	// a repeating keyword. For example, the plaintext DASHBOARD is encrypted with the
	// keyword LINUX:
	// Plaintext: DASHBOARD
	// Keyword: LINUXLINU
	// So, the first letter D is paired with the first letter of the key L. Therefore, row D
	// and column L of the Vigenère square are used to get the first cipher letter O. This
	// must be repeated for the whole ciphered.
	// You are given an array with two elements. The first element is the plaintext, the
	// second element is the keyword. Return the ciphered as uppercase string.

	return "Not implemented";
};
