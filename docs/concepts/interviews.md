# Stakeholder Interviews

Docxa bridges the "information gap" between business stakeholders and technical teams through guided, role-aware interviews.

## Role Registry

Doxa includes several pre-defined roles, each with its own focus area:

- **Product Manager**: Focuses on user problems, target audience, and feature prioritization.
- **Solution Architect**: Focuses on system design, technical constraints, and integrations.
- **Engineering Lead**: Focuses on implementation details, security, and performance.
- **Business Stakeholder**: Focuses on high-level goals and ROI.

## How it Works

1.  **Select a Template**: Doxa looks at the document template (e.g., `prd.template.json`) to see what information is missing.
2.  **Dynamic Interview Generation**: Doxa selects an interview definition (e.g., `prd.product_manager.interview.json`) that matches the role.
3.  **Agentic Conversation**: Ax-LLM conducts the interview, making sure all technical and business "evidence" required by the template is captured.
4.  **Session Persistence**: Interviews are saved in `.docxa/sessions/` and can be continued later.

## Continuous Context

Once an interview is completed, its answers are normalized and used as evidence. If you change a requirement in the code, Doxa can identify if a new interview is needed to update the documentation.
