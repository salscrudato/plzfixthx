interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const EXAMPLE_PROMPTS = [
  {
    category: "Business",
    icon: "💼",
    gradient: "from-blue-500 to-cyan-500",
    prompts: [
      "Q4 2024 sales performance review with revenue growth chart",
      "Product launch strategy for new mobile app",
      "Company quarterly goals and key metrics dashboard"
    ]
  },
  {
    category: "Education",
    icon: "🎓",
    gradient: "from-purple-500 to-pink-500",
    prompts: [
      "Introduction to Machine Learning concepts and applications",
      "World War II timeline with key events",
      "Photosynthesis process explained for high school students"
    ]
  },
  {
    category: "Marketing",
    icon: "📊",
    gradient: "from-orange-500 to-red-500",
    prompts: [
      "Social media campaign results with engagement metrics",
      "Brand positioning strategy for luxury products",
      "Customer journey map for e-commerce platform"
    ]
  }
];

export function ExamplePrompts({ onSelectPrompt }: ExamplePromptsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-[var(--neutral-1)] mb-2">
          Get Started with Examples
        </h3>
        <p className="text-sm text-[var(--neutral-4)]">
          Click any example below to try it out
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {EXAMPLE_PROMPTS.map(({ category, icon, gradient, prompts }) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-md`}>
                {icon}
              </div>
              <h4 className="text-base font-bold text-[var(--neutral-1)]">
                {category}
              </h4>
            </div>

            <div className="space-y-2">
              {prompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(prompt)}
                  className="group w-full text-left p-4 sm:p-3 rounded-[var(--radius-lg)] bg-white hover:bg-gradient-to-r hover:from-[var(--color-primary)]/5 hover:to-[var(--color-primary-light)]/5 border border-[var(--neutral-7)] hover:border-[var(--color-primary)] hover:shadow-md active:scale-98 transition-all duration-200"
                  aria-label={`Use example: ${prompt}`}
                >
                  <p className="text-sm text-[var(--neutral-2)] group-hover:text-[var(--color-primary)] font-medium leading-relaxed">
                    {prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

