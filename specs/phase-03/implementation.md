# Phase 03 Implementation: Modernization & Dark Mode

## Technical Strategy

### 1. Motion & Transitions
We will utilize `framer-motion` to handle all complex animations. 
- **Messages:** `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` with a `spring` transition.
- **Streaming:** A custom `Typewriter` component or logic within `ChatMessage.tsx` to split content by words.

### 2. Styling System (Tailwind 4)
- Leverage CSS variables in `:root` and `.dark` classes for seamless switching.
- Use `backdrop-blur-xl` and `bg-white/10` or `bg-black/40` for glass effects.
- Define custom "neon" shadow utilities in `globals.css`.

### 3. Component Architecture
- **`ChatInput`:** Transition from `<input type="text">` to a controlled `<textarea>` using `react-textarea-autosize` or a custom `useEffect` resize handler.
- **`ChatMessage`:** Add a `motion.div` wrapper and handle `ReactMarkdown` styling specifically for dark mode.

### 4. Dark Mode Logic
- Use `next-themes` (optional) or a simple React Context to manage state.
- Ensure all `slate-` colors are mapped to appropriate `dark:text-slate-` equivalents.

## File Changes
- `frontend/src/app/globals.css`: Massive overhaul for theme variables.
- `frontend/src/components/*`: Refactoring for slim/dark aesthetics.
- `frontend/src/app/page.tsx`: Layout adjustments for the floating footer.
