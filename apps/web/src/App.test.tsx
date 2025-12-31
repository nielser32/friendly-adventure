import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('surfaces the starter messaging', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /full-stack starter focused on quality/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Vite \+ React front-end/i)).toBeInTheDocument()
  })

  it('lists resource links', () => {
    render(<App />)

    const links = screen.getAllByRole('link', { name: /resource/i })
    expect(links.length).toBeGreaterThanOrEqual(3)
  })
})
