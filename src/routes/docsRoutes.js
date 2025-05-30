// API Documentation routes - provides interactive documentation for the API
// Similar to Android's built-in documentation or Swagger UI

const express = require('express');
const router = express.Router();

// GET /api/docs - Interactive API Documentation
router.get('/', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    
    res.json({
        title: "Jeff Koretke API Documentation",
        version: "1.0.0",
        description: "REST API for jeffkoretke.com portfolio website",
        author: "Jeff Koretke",
        baseUrl: {
            current: baseUrl,
            development: "http://localhost:3000",
            production: "[Your deployed URL will go here]"
        },
        lastUpdated: new Date().toISOString(),
        
        endpoints: {
            health: {
                method: "GET",
                path: "/api/health",
                description: "Check API server status and health",
                headers: {},
                body: null,
                responses: {
                    200: {
                        description: "Server is healthy",
                        example: {
                            status: "healthy",
                            timestamp: "2025-05-29T10:30:00.000Z",
                            message: "API is running successfully"
                        }
                    }
                },
                testUrl: `${baseUrl}/api/health`
            },
            
            info: {
                method: "GET",
                path: "/api/info",
                description: "Get API information and available endpoints",
                headers: {},
                body: null,
                responses: {
                    200: {
                        description: "API information",
                        example: {
                            name: "jeffkoretke-api",
                            version: "1.0.0",
                            description: "REST API for jeffkoretke.com",
                            author: "Jeff Koretke",
                            endpoints: ["GET /api/health", "GET /api/info", "POST /api/contact"]
                        }
                    }
                },
                testUrl: `${baseUrl}/api/info`
            },
            
            contact: {
                submit: {
                    method: "POST",
                    path: "/api/contact",
                    description: "Submit contact form from website",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: {
                        required: ["name", "email", "subject", "message"],
                        schema: {
                            name: {
                                type: "string",
                                validation: "2-50 characters, letters/spaces/hyphens/apostrophes/periods only",
                                example: "John Doe"
                            },
                            email: {
                                type: "string",
                                validation: "Valid email format, max 100 characters",
                                example: "john.doe@example.com"
                            },
                            subject: {
                                type: "string",
                                validation: "5-100 characters",
                                example: "Project Inquiry"
                            },
                            message: {
                                type: "string",
                                validation: "10-1000 characters",
                                example: "I'm interested in discussing a potential project with you."
                            }
                        },
                        example: {
                            name: "John Doe",
                            email: "john.doe@example.com",
                            subject: "Project Inquiry",
                            message: "I'm interested in discussing a potential project with you."
                        }
                    },
                    responses: {
                        201: {
                            description: "Contact form submitted successfully",
                            example: {
                                success: true,
                                message: "Contact form submitted successfully",
                                submissionId: "1732876543210",
                                timestamp: "2025-05-29T10:30:00.000Z"
                            }
                        },
                        400: {
                            description: "Validation errors",
                            example: {
                                success: false,
                                message: "Validation failed",
                                errors: [
                                    {
                                        type: "field",
                                        msg: "Name must be between 2 and 50 characters",
                                        path: "name",
                                        location: "body"
                                    }
                                ]
                            }
                        },
                        500: {
                            description: "Internal server error",
                            example: {
                                success: false,
                                message: "Internal server error while processing contact form"
                            }
                        }
                    },
                    testUrl: `${baseUrl}/api/contact`
                },
                
                getAll: {
                    method: "GET",
                    path: "/api/contact",
                    description: "Get all contact submissions (admin endpoint)",
                    headers: {},
                    body: null,
                    responses: {
                        200: {
                            description: "List of all contact submissions",
                            example: {
                                success: true,
                                count: 2,
                                submissions: [
                                    {
                                        id: "1732876543210",
                                        name: "John Doe",
                                        email: "john.doe@example.com",
                                        subject: "Project Inquiry",
                                        message: "I'm interested in discussing a potential project.",
                                        timestamp: "2025-05-29T10:30:00.000Z"
                                    }
                                ]
                            }
                        }
                    },
                    testUrl: `${baseUrl}/api/contact`
                },
                
                getById: {
                    method: "GET",
                    path: "/api/contact/:id",
                    description: "Get specific contact submission by ID",
                    parameters: {
                        id: {
                            type: "string",
                            description: "Contact submission ID",
                            example: "1732876543210"
                        }
                    },
                    responses: {
                        200: {
                            description: "Contact submission found",
                            example: {
                                success: true,
                                submission: {
                                    id: "1732876543210",
                                    name: "John Doe",
                                    email: "john.doe@example.com",
                                    subject: "Project Inquiry",
                                    message: "I'm interested in discussing a potential project.",
                                    timestamp: "2025-05-29T10:30:00.000Z"
                                }
                            }
                        },
                        404: {
                            description: "Contact submission not found",
                            example: {
                                success: false,
                                message: "Contact submission not found"
                            }
                        }
                    },
                    testUrl: `${baseUrl}/api/contact/1732876543210`
                }
            },
            
            projects: {
                method: "GET",
                path: "/api/projects",
                description: "Get portfolio projects for display on website",
                headers: {},
                body: null,
                parameters: {
                    featured: {
                        type: "boolean",
                        description: "Filter for featured projects only (optional)",
                        example: "?featured=true"
                    },
                    category: {
                        type: "string", 
                        description: "Filter by project category (optional)",
                        example: "?category=mobile"
                    }
                },
                responses: {
                    200: {
                        description: "List of portfolio projects",
                        example: {
                            success: true,
                            data: [
                                {
                                    id: "1",
                                    title: "Android E-Commerce App",
                                    description: "Native Android app for online shopping with payment integration",
                                    technologies: ["Kotlin", "MVVM", "Room", "Retrofit", "Stripe API"],
                                    image: "/images/ecommerce-app.jpg",
                                    demoUrl: "https://play.google.com/store/apps/details?id=com.example.shop",
                                    githubUrl: "https://github.com/jkoretke/ecommerce-android",
                                    featured: true,
                                    category: "mobile",
                                    completedDate: "2024-03-15"
                                }
                            ]
                        }
                    }
                },
                testUrl: `${baseUrl}/api/projects`
            },
            
            about: {
                method: "GET",
                path: "/api/about",
                description: "Get about me information for website",
                headers: {},
                body: null,
                responses: {
                    200: {
                        description: "About me information",
                        example: {
                            success: true,
                            data: {
                                name: "Jeff Koretke",
                                title: "Android Developer",
                                bio: "Experienced Android developer with expertise in Kotlin, MVVM architecture, and modern Android development practices.",
                                location: "Your Location",
                                email: "jeff@jeffkoretke.com",
                                resume: "/files/jeff-koretke-resume.pdf",
                                skills: {
                                    languages: ["Kotlin", "Java", "JavaScript", "Python"],
                                    mobile: ["Android SDK", "Jetpack Compose", "MVVM", "Room"],
                                    backend: ["Node.js", "Express.js", "REST APIs"],
                                    tools: ["Git", "Android Studio", "VS Code", "Figma"]
                                },
                                experience: [
                                    {
                                        company: "Company Name",
                                        position: "Android Developer",
                                        duration: "2022 - Present",
                                        description: "Developed and maintained Android applications..."
                                    }
                                ]
                            }
                        }
                    }
                },
                testUrl: `${baseUrl}/api/about`
            }
        },
        
        frontendIntegration: {
            corsOrigins: [
                "https://jeffkoretke.com",
                "https://www.jeffkoretke.com",
                "http://localhost:3000",
                "http://127.0.0.1:5500"
            ],
            examples: {
                fetchProjects: {
                    description: "Load portfolio projects",
                    code: `
// Load portfolio projects
async function loadProjects() {
  try {
    const response = await fetch('${baseUrl}/api/projects');
    const result = await response.json();
    
    if (result.success) {
      const projects = result.data;
      renderProjects(projects);
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}`
                },
                submitContact: {
                    description: "Submit contact form",
                    code: `
// Submit contact form
async function submitContactForm(formData) {
  try {
    const response = await fetch('${baseUrl}/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showSuccessMessage('Form submitted successfully!');
    } else {
      showValidationErrors(result.errors);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}`
                },
                loadAbout: {
                    description: "Load about information", 
                    code: `
// Load about information
async function loadAboutInfo() {
  try {
    const response = await fetch('${baseUrl}/api/about');
    const result = await response.json();
    
    if (result.success) {
      const aboutData = result.data;
      updateAboutPage(aboutData);
    }
  } catch (error) {
    console.error('Error loading about info:', error);
  }
}`
                }
            }
        },
        
        errorHandling: {
            commonStatusCodes: {
                200: "Success (GET requests)",
                201: "Created (POST requests)", 
                400: "Bad Request (validation errors)",
                404: "Not Found (resource doesn't exist)",
                500: "Internal Server Error"
            },
            errorFormat: {
                description: "All error responses follow this format",
                example: {
                    success: false,
                    message: "Error description",
                    errors: []
                }
            }
        },
        
        testing: {
            description: "You can test these endpoints directly by visiting the testUrl for each endpoint",
            tools: [
                "Browser (for GET requests)",
                "Postman",
                "VS Code REST Client",
                "Thunder Client", 
                "curl"
            ]
        }
    });
});

module.exports = router;
