const generateBtn = document.getElementById('generate-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers');

const getNumberColor = (number) => {
  if (number <= 10) return '#fbc400'; // Yellow
  if (number <= 20) return '#69c8f2'; // Blue
  if (number <= 30) return '#ff7272'; // Red
  if (number <= 40) return '#aaa'; // Gray
  return '#b0d840'; // Green
};

generateBtn.addEventListener('click', () => {
  lottoNumbersContainer.innerHTML = '';
  const numbers = new Set();
  while(numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

  sortedNumbers.forEach(number => {
    const ball = document.createElement('div');
    ball.className = 'lotto-ball';
    ball.style.backgroundColor = getNumberColor(number);
    ball.textContent = number;
    lottoNumbersContainer.appendChild(ball);
  });
});
