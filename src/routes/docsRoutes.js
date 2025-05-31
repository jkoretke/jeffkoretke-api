// API Documentation routes - provides interactive documentation for the API
// Similar to Android's built-in documentation or Swagger UI

const express = require('express');
const router = express.Router();
const { readOnlyLimiter } = require('../middleware/rateLimiter');

// GET /api/docs - Interactive API Documentation with read-only rate limiting
router.get('/', readOnlyLimiter, (req, res) => {
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
                    },                    testUrl: `${baseUrl}/api/contact/1732876543210`
                }
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
                    }                },
                testUrl: `${baseUrl}/api/about`
            },
            
            isItNotFriday: {
                method: "GET",
                path: "/api/isitnotfriday",
                description: "Check if today is NOT Friday - returns 'Yes' if not Friday, 'No' if Friday",
                headers: {},
                body: null,
                responses: {
                    200: {
                        description: "Friday check result",
                        example: {
                            success: true,
                            question: "Is it not Friday?",
                            answer: "Yes",
                            details: {
                                currentDay: "Thursday",
                                isFriday: false,
                                dayOfWeek: 4,
                                timestamp: "2025-05-30T00:22:09.861Z",
                                timezone: "America/Los_Angeles"
                            },
                            message: "It's Thursday. Still waiting for Friday! ⏰"
                        }
                    },
                    500: {
                        description: "Internal server error",
                        example: {
                            success: false,
                            message: "Internal server error while checking day"
                        }
                    }                },
                testUrl: `${baseUrl}/api/isitnotfriday`
            },
            
            about: {
                method: "GET",
                path: "/api/about",
                description: "Get comprehensive about me information for website",
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
                                location: "United States",
                                email: "jeff@jeffkoretke.com",
                                skills: {
                                    languages: ["Kotlin", "Java", "JavaScript", "Python", "TypeScript"],
                                    mobile: ["Android SDK", "Jetpack Compose", "MVVM Architecture", "Room Database"],
                                    backend: ["Node.js", "Express.js", "REST APIs", "MongoDB"],
                                    tools: ["Git", "Android Studio", "VS Code", "Figma"]
                                },
                                experience: [
                                    {
                                        company: "Your Current Company",
                                        position: "Senior Android Developer",
                                        duration: "2022 - Present",
                                        description: "Lead Android application development using Kotlin and Jetpack Compose."
                                    }
                                ],
                                socialLinks: {
                                    github: "https://github.com/jkoretke",
                                    linkedin: "https://linkedin.com/in/jeffkoretke",
                                    portfolio: "https://jeffkoretke.com"
                                },
                                availability: {
                                    status: "Available for new opportunities",
                                    remoteWork: true
                                }
                            },
                            lastUpdated: "2025-05-30T00:30:00.000Z",
                            message: "About information retrieved successfully"
                        }
                    },
                    500: {
                        description: "Internal server error",
                        example: {
                            success: false,
                            message: "Internal server error while fetching about information"
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
                "http://127.0.0.1:5500"            ],
            examples: {
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
