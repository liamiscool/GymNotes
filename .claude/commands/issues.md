You are an AI assistant tasked with creating well-structured GitHub issues for feature
  requests, bug reports, or improvement ideas. Your goal is to turn the provided feature
  description into a comprehensive GitHub issue that follows best practices and project
  conventions.

  First, you will be given a feature description and a repository URL. Here they are:
  <feature_description>
  #$ARGUMENTS
  </feature_description>

  Repository URL: https://github.com/liamiscool/GymNotes

  Follow these steps to complete the task, make a todo list and think ultrahard:

  ## 1. Research the repository:
  - Visit the provided repo_url and examine the repository's structure, existing issues, and 
  documentation
  - Look for any CONTRIBUTING.md, ISSUE_TEMPLATE.md, or similar files that might contain
  guidelines for creating issues
  - Note the project's coding style, naming conventions, and any specific requirements for
  submitting issues
  - Understand the current architecture and components

  ## 2. Apply GitHub Issue Best Practices:
  Use these established best practices for writing effective GitHub issues:

  ### Essential Elements
  - **Descriptive Titles**: Use concise, descriptive titles that summarize the issue clearly (e.g., "Bug: App crashes when clicking login button"). Use imperative mood and don't end with a period.
  - **Detailed Description**: Provide context, including what you expected vs. what actually occurred. State goals clearly and be explicit about deliverables.
  - **Steps to Reproduce**: Include step-by-step instructions for replicating bugs with clear examples.

  ### Issue Structure Best Practices
  - **Keep Issues Focused**: Each bug or feature request should be documented in its own issue. An issue should be a discrete, well-defined unit of work (not more than a couple of weeks' work).
  - **Avoid Duplication**: Search existing issues first to prevent duplicates.
  - **Clear Deliverables**: Each issue should conclude with a clear deliverable and closing summary when resolved.

  ### Effective Communication
  - **Use @mentions purposefully**: Each mention triggers an email notification - use them to bring the right people into the conversation at the right time.
  - **Strategic Labeling**: Apply labels that reflect the issue's nature and status without overcomplicating. Use labels like 'to triage', 'needs more info', 'good first issue', and 'help wanted' appropriately.
  - **Proper Closing**: When resolved, provide a closing summary that encapsulates key outcomes and links to relevant documentation or results.

  ### Modern GitHub Features
  - **Issue Templates**: Use standardized templates for bug reports, feature requests, and support questions.
  - **Sub-issues**: Break down complex work using sub-issues to track the full hierarchy.
  - **Project Integration**: Leverage GitHub's built-in project management features for better organization.

  ### GymNotes Project-Specific Best Practices
  Based on analysis of existing issues in this repository:

  #### Structure and Formatting
  - **Emoji Prefixes**: Use relevant emojis in titles (🔧 for enhancements, 🐛 for bugs, 📱 for UI, 🎯 for goals)
  - **Comprehensive Sections**: Include Problem Statement, Current State, Proposed Solution, Technical Implementation, Acceptance Criteria
  - **Code Examples**: Provide TypeScript interfaces and implementation snippets when relevant
  - **File References**: List specific files to be modified with full paths (e.g., `src/services/aiParser.ts`)
  - **Database Schema**: Include SQL schema changes when database modifications are needed

  #### Technical Documentation
  - **API Endpoints**: Document new endpoints with method and path
  - **Component Interfaces**: Define TypeScript interfaces for new features
  - **User Flow Documentation**: Include step-by-step user experience flows
  - **Success Metrics**: Define measurable success criteria for features
  - **Priority and Effort Estimation**: Include priority level and estimated effort (e.g., "Large (6-8 weeks)")

  #### Content Organization
  - **Logical Grouping**: Use clear section headers with appropriate hierarchy
  - **Example-Rich**: Provide concrete examples of inputs, outputs, and user interactions
  - **Future-Proof**: Include "Related Features" and "Technical Considerations" sections
  - **Monetization Integration**: Consider how features relate to free vs pro functionality
  - **Design References**: Reference similar features in other apps for design inspiration

  ## 3. Present a plan:
  - Based on your research, outline a plan for creating the GitHub issue
  - Include the proposed structure of the issue, any labels or milestones you plan to use, and
  how you'll incorporate project-specific conventions
  - Present this plan in <plan> tags

  ## 4. Create the GitHub issue:
  - Once the plan is approved, draft the GitHub issue content
  - Include a clear title, detailed description, acceptance criteria, and any additional context
  or resources that would be helpful for developers
  - Use appropriate formatting (e.g., Markdown) to enhance readability
  - Add any relevant labels, milestones, or assignees based on the project's conventions
  - Consider the current state of the repository and how this issue fits into the overall project
   goals

  ## 5. Final output and project board integration:
  - Present the complete GitHub issue content in <github_issue> tags
  - Do not include any explanations or notes outside of these tags in your final output
  - Make sure the content is ready to be copied and pasted directly into GitHub
  - Use the GitHub CLI 'gh issue create' to create the actual issue after you generate
  - Assign either the label 'bug' or 'enhancement' based on the nature of the issue
  - **IMPORTANT**: After creating the issue, automatically add it to the "GymNotes Development"
  project board and assign it to the "Backlog" status/column using these commands:
    ```bash
    # Create the issue first
    gh issue create --title "..." --body "..." --label "..."

    # Then add to project board Backlog column
    gh project item-add 2 --url [ISSUE_URL]
    gh project item-edit --id [ITEM_ID] --field-id [STATUS_FIELD_ID] --single-select-option-id
  [BACKLOG_OPTION_ID]

  Remember to think carefully about the feature description and how to best present it as a
  GitHub issue. Consider the perspective of both the project maintainers and potential
  contributors who might work on this feature. The repository structure and components may evolve
   over time, so always research the current state rather than assuming specific file paths or
  structures.

  Your final output should consist of only the content within the  tags, ready to be copied and
  pasted directly into GitHub. Always ensure the issue is properly added to the project boards
  Backlog column for proper workflow tracking.