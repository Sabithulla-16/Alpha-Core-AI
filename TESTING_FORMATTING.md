# Test Examples for KaTeX and Code Formatting

## How to Test Code and Math Rendering

### Testing Code Blocks

1. **Python Code Example**
   - Send: "Write a Python function to calculate factorial"
   - Expected: Code block with syntax highlighting and copy button

2. **JavaScript Example**
   - Send: "Show me async/await syntax"
   - Expected: JavaScript code with color-coded keywords, strings, numbers

3. **SQL Example**
   - Send: "Write a SQL query to find top 10 customers"
   - Expected: SQL code with syntax highlighting

### Testing Math Formatting

1. **Inline Math**
   - Send: "Explain Einstein's equation"
   - Model response includes: $E = mc^2$
   - Expected: Formula properly rendered inline

2. **Block Math**
   - Send: "Show me the quadratic formula"
   - Model response includes: $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
   - Expected: Formula displayed on its own line

3. **Complex Equations**
   - Send: "Explain the integral for Gaussian distribution"
   - Expected: Multi-line equation rendering:
   $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

## Code Block Features

### Copy Button
- Located in top-right of every code block
- Shows "Copy" icon
- On click: Copies code to clipboard
- Shows "Copied!" confirmation for 2 seconds

### Syntax Highlighting Colors
- **Keywords**: Purple (#c4b5fd)
- **Strings**: Green (#86e1a0)
- **Numbers**: Amber (#fbbf24)
- **Functions**: Blue (#60a5fa)
- **Comments**: Gray (#6b7280) and italic
- **Built-ins**: Pink (#f472b6)

## Supported Code Languages

The syntax highlighter supports:
- Python
- JavaScript / TypeScript
- Java
- C / C# / C++
- SQL
- HTML / XML
- CSS
- Go
- Rust
- Ruby
- PHP
- Bash / Shell
- YAML
- JSON
- And 150+ more languages

## KaTeX Supported LaTeX Commands

### Common Math Operators
- Fractions: `\frac{a}{b}`
- Square roots: `\sqrt{x}`
- Superscripts: `x^2`
- Subscripts: `x_i`
- Greek letters: `\alpha, \beta, \gamma, \Delta`
- Integrals: `\int_a^b f(x) dx`
- Summation: `\sum_{i=1}^n a_i`
- Limits: `\lim_{x \to 0}`

### Matrices and Arrays
```latex
\begin{matrix}
a & b \\
c & d
\end{matrix}
```

### Calculus
- Derivatives: `\frac{df}{dx}`
- Partial derivatives: `\frac{\partial f}{\partial x}`
- Differential operator: `\nabla`

### Sets and Logic
- Union: `\cup`
- Intersection: `\cap`
- Element of: `\in`
- For all: `\forall`
- Exists: `\exists`

## Testing Workflow

1. **Start Backend**
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**
   - Navigate to `http://localhost:3000`

4. **Select Model**
   - Choose "DeepSeek Coder" or "OpenCoder" for best code examples
   - Or use "Mistral 7B" for math-heavy responses

5. **Send Test Prompts**
   - Examples provided above
   - Watch for proper rendering of code blocks and math

6. **Test Copy Button**
   - Hover over any code block
   - Click the "Copy" button
   - Paste somewhere to verify content

## Troubleshooting

### Math Not Rendering
- Check browser console for KaTeX errors
- Ensure KaTeX CSS is loaded (should be automatic)
- Try hard refresh: Ctrl+Shift+R

### Code Not Highlighting
- Ensure language is specified: ` ```python`
- Check code block syntax
- Try simple code first to verify highlighting works

### Copy Button Not Working
- Check browser permissions for clipboard access
- Try different code block
- Verify JavaScript is enabled

## Performance Notes

- Code syntax highlighting is instant
- KaTeX rendering may take 100-200ms for complex equations
- Both are optimized for smooth performance
- No loading delays for simple expressions

## Browser Compatibility

### Tested and Supported
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Limitations
- IE 11 and older: Not supported (KaTeX requires modern JS)

## Future Enhancements

Potential additions:
- More color themes for syntax highlighting
- LaTeX preview on hover
- Copy button for math expressions
- Code block language selector
- Custom font selection
