/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit', 
  purge: ["./views/*.ejs"],
  content: ["./views/*.ejs"],
  theme: {
    extend: {      
      colors: {
      gray: {
        900: '#202225',
        800: '#2f3136',
        700: '#36393f',
        600: '#4f545c',
        400: '#d4d7dc',
        300: '#e3e5e8',
        200: '#ebedef',
        100: '#f2f3f5',
      },
      'main': '#4600E7',
      },
      spacing: {
        88: '22rem',
      },
      fontFamily: {
        VarelaRound: ['Varela Round']
      }
    },
  },
  plugins: [],
}
