
(function() {
  const { useState, useEffect } = React;
  const { motion, AnimatePresence } = window.FramerMotion || {
    motion: { div: "div", h1: "h1", li: "li", button: "button" },
    AnimatePresence: ({ children }) => children
  };

  function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [currentRole, setCurrentRole] = useState("employee");
    const [orders, setOrders] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shareCode, setShareCode] = useState("");
    const [viewedCard, setViewedCard] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [activeTab, setActiveTab] = useState("wallet");
    const [selectedCard, setSelectedCard] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [filteredContacts, setFilteredContacts] = useState([]);
    
    // Company form states
    const [companyName, setCompanyName] = useState("");
    const [brandColors, setBrandColors] = useState("");
    const [logo, setLogo] = useState("");
    
    // Designer form states
    const [selectedOrder, setSelectedOrder] = useState("");
    const [designTemplate, setDesignTemplate] = useState("");
    
    // HR form states
    const [selectedDesign, setSelectedDesign] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [employeeTitle, setEmployeeTitle] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const [employeePhone, setEmployeePhone] = useState("");

    // Load data from localStorage
    useEffect(() => {
      setOrders(JSON.parse(localStorage.getItem("orders")) || []);
      setDesigns(JSON.parse(localStorage.getItem("designs")) || []);
      setEmployees(JSON.parse(localStorage.getItem("employees")) || []);
      setConnectionRequests(JSON.parse(localStorage.getItem("connectionRequests")) || []);
      setConnections(JSON.parse(localStorage.getItem("connections")) || []);
      
      const savedDarkMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedDarkMode);
      if (savedDarkMode) {
        document.body.classList.add("dark");
      }
      
      const savedLoginState = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(savedLoginState);
    }, []);

    // Filter contacts based on search
    useEffect(() => {
      if (currentRole === "employee") {
        const currentUser = employees[0];
        if (currentUser) {
          // Get all connected employees
          const connectedIds = connections
            .filter(conn => conn.employeeId1 === currentUser.id || conn.employeeId2 === currentUser.id)
            .map(conn => conn.employeeId1 === currentUser.id ? conn.employeeId2 : conn.employeeId1);
          
          let allContacts = employees.filter(emp => connectedIds.includes(emp.id) || emp.id === currentUser.id);
          
          if (searchQuery) {
            allContacts = allContacts.filter(contact => 
              contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              contact.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              contact.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          
          // Sort alphabetically by name
          allContacts.sort((a, b) => a.name.localeCompare(b.name));
          setFilteredContacts(allContacts);
        }
      }
    }, [employees, connections, searchQuery, currentRole]);

    // Save data to localStorage
    useEffect(() => {
      localStorage.setItem("orders", JSON.stringify(orders));
      localStorage.setItem("designs", JSON.stringify(designs));
      localStorage.setItem("employees", JSON.stringify(employees));
      localStorage.setItem("connectionRequests", JSON.stringify(connectionRequests));
      localStorage.setItem("connections", JSON.stringify(connections));
    }, [orders, designs, employees, connectionRequests, connections]);

    const toggleDarkMode = () => {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      localStorage.setItem("darkMode", newDarkMode);
      document.body.classList.toggle("dark", newDarkMode);
    };

    const handleLogin = () => {
      if (loginUsername.trim() && loginPassword.trim()) {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        setLoginUsername("");
        setLoginPassword("");
      } else {
        alert("Please enter both username and password");
      }
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
      setShowMenu(false);
    };

    const generateShareCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    const handlePhoneCall = (phoneNumber) => {
      if (confirm(`Do you want to call ${phoneNumber}?`)) {
        window.open(`tel:${phoneNumber}`);
      }
    };

    const handleEmail = (email) => {
      if (confirm(`Do you want to send an email to ${email}?`)) {
        window.open(`mailto:${email}`);
      }
    };

    const handleAddress = (companyName) => {
      if (confirm(`Do you want to view ${companyName} on maps?`)) {
        window.open(`https://maps.google.com/?q=${encodeURIComponent(companyName)}`);
      }
    };

    const searchPublicCards = (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      
      const results = employees.filter(emp => 
        emp.isPublic && 
        (emp.name.toLowerCase().includes(query.toLowerCase()) ||
         emp.companyName.toLowerCase().includes(query.toLowerCase()) ||
         emp.title.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results);
    };

    const sendConnectionRequest = (targetEmployeeId) => {
      const currentUser = employees[0];
      if (!currentUser) return;
      
      const newRequest = {
        id: Date.now(),
        fromEmployeeId: currentUser.id,
        toEmployeeId: targetEmployeeId,
        fromName: currentUser.name,
        fromCompany: currentUser.companyName,
        status: "pending",
        createdAt: new Date().toLocaleDateString()
      };
      
      setConnectionRequests([...connectionRequests, newRequest]);
      alert("Connection request sent!");
    };

    const acceptConnectionRequest = (requestId) => {
      const request = connectionRequests.find(req => req.id === requestId);
      if (!request) return;
      
      const newConnection = {
        id: Date.now(),
        employeeId1: request.fromEmployeeId,
        employeeId2: request.toEmployeeId,
        connectedAt: new Date().toLocaleDateString()
      };
      
      setConnections([...connections, newConnection]);
      setConnectionRequests(connectionRequests.filter(req => req.id !== requestId));
      alert("Connection accepted!");
    };

    const rejectConnectionRequest = (requestId) => {
      setConnectionRequests(connectionRequests.filter(req => req.id !== requestId));
    };

    const updateJobAndNotifyConnections = (employeeId, newCompany, newTitle) => {
      const updatedEmployees = employees.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, companyName: newCompany, title: newTitle, shareCode: generateShareCode() };
        }
        return emp;
      });
      
      setEmployees(updatedEmployees);
      
      const userConnections = connections.filter(conn => 
        conn.employeeId1 === employeeId || conn.employeeId2 === employeeId
      );
      
      if (userConnections.length > 0) {
        alert(`Job update sent to ${userConnections.length} connections!`);
      }
    };

    const toggleProfileVisibility = (employeeId) => {
      const updatedEmployees = employees.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, isPublic: !emp.isPublic };
        }
        return emp;
      });
      setEmployees(updatedEmployees);
    };

    const handleCompanySubmit = () => {
      if (!companyName || !brandColors) return;
      
      const newOrder = {
        id: Date.now(),
        companyName,
        brandColors,
        logo,
        status: "pending",
        createdAt: new Date().toLocaleDateString()
      };
      
      setOrders([...orders, newOrder]);
      setCompanyName("");
      setBrandColors("");
      setLogo("");
      alert("Order placed successfully!");
    };

    const handleDesignSubmit = () => {
      if (!selectedOrder || !designTemplate) return;
      
      const newDesign = {
        id: Date.now(),
        orderId: parseInt(selectedOrder),
        template: designTemplate,
        createdAt: new Date().toLocaleDateString()
      };
      
      setDesigns([...designs, newDesign]);
      
      setOrders(orders.map(order => 
        order.id === parseInt(selectedOrder) 
          ? { ...order, status: "designed" }
          : order
      ));
      
      setSelectedOrder("");
      setDesignTemplate("");
      alert("Design created successfully!");
    };

    const handleHRSubmit = () => {
      if (!selectedDesign || !employeeName || !employeeTitle || !employeeEmail) return;
      
      const design = designs.find(d => d.id === parseInt(selectedDesign));
      const order = orders.find(o => o.id === design.orderId);
      
      const newEmployee = {
        id: Date.now(),
        name: employeeName,
        title: employeeTitle,
        email: employeeEmail,
        phone: employeePhone,
        designId: parseInt(selectedDesign),
        companyName: order.companyName,
        brandColors: order.brandColors,
        template: design.template,
        shareCode: generateShareCode(),
        isPublic: false,
        createdAt: new Date().toLocaleDateString()
      };
      
      setEmployees([...employees, newEmployee]);
      setSelectedDesign("");
      setEmployeeName("");
      setEmployeeTitle("");
      setEmployeeEmail("");
      setEmployeePhone("");
      alert("Employee card assigned successfully!");
    };

    const handleShareCodeLookup = () => {
      const card = employees.find(emp => emp.shareCode === shareCode.toUpperCase());
      if (card) {
        setViewedCard(card);
      } else {
        alert("Invalid share code!");
      }
      setShareCode("");
    };

    const renderHamburgerMenu = () => {
      if (!showMenu) return null;

      return React.createElement("div", {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "250px",
          height: "100vh",
          background: darkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          zIndex: 1000,
          padding: "60px 20px 20px 20px",
          boxShadow: "2px 0 20px rgba(0,0,0,0.1)"
        }
      }, [
        React.createElement("div", {
          key: "menu-items",
          style: { display: "flex", flexDirection: "column", gap: "15px" }
        }, [
          React.createElement("button", {
            key: "theme-btn",
            onClick: () => {
              toggleDarkMode();
              setShowMenu(false);
            },
            style: {
              background: "none",
              border: "none",
              padding: "15px",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "10px",
              color: darkMode ? "#f3f4f6" : "#374151",
              fontSize: "16px"
            }
          }, `${darkMode ? "☀️" : "🌙"} ${darkMode ? "Light Mode" : "Dark Mode"}`),
          
          React.createElement("button", {
            key: "profile-btn",
            onClick: () => setShowMenu(false),
            style: {
              background: "none",
              border: "none",
              padding: "15px",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "10px",
              color: darkMode ? "#f3f4f6" : "#374151",
              fontSize: "16px"
            }
          }, "👤 Profile Settings"),
          
          React.createElement("button", {
            key: "privacy-btn",
            onClick: () => setShowMenu(false),
            style: {
              background: "none",
              border: "none",
              padding: "15px",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "10px",
              color: darkMode ? "#f3f4f6" : "#374151",
              fontSize: "16px"
            }
          }, "🔒 Privacy"),
          
          React.createElement("button", {
            key: "help-btn",
            onClick: () => setShowMenu(false),
            style: {
              background: "none",
              border: "none",
              padding: "15px",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "10px",
              color: darkMode ? "#f3f4f6" : "#374151",
              fontSize: "16px"
            }
          }, "❓ Help & Support"),
          
          React.createElement("button", {
            key: "logout-btn",
            onClick: handleLogout,
            style: {
              background: "none",
              border: "none",
              padding: "15px",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "10px",
              color: "#EF4444",
              fontSize: "16px",
              marginTop: "20px",
              borderTop: `1px solid ${darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.5)"}`,
              paddingTop: "20px"
            }
          }, "🚪 Logout")
        ])
      ]);
    };

    const renderWalletView = () => {
      if (selectedCard) {
        return React.createElement("div", {
          style: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: darkMode ? "#111827" : "#f9fafb",
            zIndex: 500,
            display: "flex",
            flexDirection: "column"
          }
        }, [
          React.createElement("div", {
            key: "card-header",
            style: {
              padding: "50px 20px 20px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }
          }, [
            React.createElement("button", {
              key: "back-btn",
              onClick: () => setSelectedCard(null),
              style: {
                background: "none",
                border: "none",
                fontSize: "16px",
                color: "#007AFF",
                cursor: "pointer"
              }
            }, "← Back"),
            React.createElement("h3", {
              key: "card-title",
              style: { margin: 0, fontSize: "17px", fontWeight: "600" }
            }, "Contact"),
            React.createElement("div", { key: "spacer" })
          ]),
          
          React.createElement("div", {
            key: "card-content",
            style: {
              flex: 1,
              padding: "0 20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }
          }, [
            React.createElement("div", {
              key: "business-card",
              style: {
                width: "320px",
                height: "200px",
                background: `linear-gradient(135deg, ${selectedCard.brandColors || '#6366f1, #9333ea'})`,
                borderRadius: "15px",
                padding: "20px",
                color: "white",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }
            }, [
              React.createElement("div", { key: "card-top" }, [
                React.createElement("h2", {
                  key: "name",
                  style: { margin: "0 0 5px 0", fontSize: "24px", fontWeight: "700" }
                }, selectedCard.name),
                React.createElement("p", {
                  key: "title",
                  style: { margin: "0 0 10px 0", fontSize: "16px", opacity: 0.9 }
                }, selectedCard.title),
                React.createElement("p", {
                  key: "company",
                  style: { margin: "0", fontSize: "14px", opacity: 0.8 }
                }, selectedCard.companyName)
              ]),
              
              React.createElement("div", { key: "card-bottom" }, [
                React.createElement("div", {
                  key: "contact-info",
                  style: { display: "flex", flexDirection: "column", gap: "5px" }
                }, [
                  React.createElement("button", {
                    key: "email-btn",
                    onClick: () => handleEmail(selectedCard.email),
                    style: {
                      background: "none",
                      border: "none",
                      color: "white",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "2px 0",
                      textDecoration: "underline"
                    }
                  }, selectedCard.email),
                  
                  selectedCard.phone && React.createElement("button", {
                    key: "phone-btn",
                    onClick: () => handlePhoneCall(selectedCard.phone),
                    style: {
                      background: "none",
                      border: "none",
                      color: "white",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "2px 0",
                      textDecoration: "underline"
                    }
                  }, selectedCard.phone),
                  
                  React.createElement("button", {
                    key: "address-btn",
                    onClick: () => handleAddress(selectedCard.companyName),
                    style: {
                      background: "none",
                      border: "none",
                      color: "white",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "2px 0",
                      textDecoration: "underline"
                    }
                  }, "📍 View on Maps")
                ])
              ])
            ])
          ])
        ]);
      }

      return React.createElement("div", {
        style: {
          padding: "50px 20px 100px 20px",
          minHeight: "100vh"
        }
      }, [
        React.createElement("div", {
          key: "search-section",
          style: { marginBottom: "20px" }
        }, [
          React.createElement("input", {
            key: "search-input",
            type: "text",
            placeholder: "Search contacts...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            style: {
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "none",
              background: darkMode ? "rgba(55, 65, 81, 0.8)" : "rgba(243, 244, 246, 0.8)",
              fontSize: "16px",
              outline: "none"
            }
          })
        ]),
        
        React.createElement("div", {
          key: "contacts-stack",
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }
        }, filteredContacts.map((contact, index) => 
          React.createElement("div", {
            key: contact.id,
            onClick: () => setSelectedCard(contact),
            style: {
              background: `linear-gradient(135deg, ${contact.brandColors || '#6366f1, #9333ea'})`,
              borderRadius: "15px",
              padding: "20px",
              color: "white",
              cursor: "pointer",
              transform: `translateY(${index * 2}px)`,
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease",
              marginBottom: index === filteredContacts.length - 1 ? "0" : "-10px",
              zIndex: filteredContacts.length - index
            }
          }, [
            React.createElement("div", {
              key: "contact-info",
              style: { display: "flex", justifyContent: "space-between", alignItems: "center" }
            }, [
              React.createElement("div", { key: "contact-details" }, [
                React.createElement("h3", {
                  key: "name",
                  style: { margin: "0 0 5px 0", fontSize: "18px", fontWeight: "600" }
                }, contact.name),
                React.createElement("p", {
                  key: "title",
                  style: { margin: "0 0 3px 0", fontSize: "14px", opacity: 0.9 }
                }, contact.title),
                React.createElement("p", {
                  key: "company",
                  style: { margin: "0", fontSize: "13px", opacity: 0.8 }
                }, contact.companyName)
              ]),
              React.createElement("div", {
                key: "chevron",
                style: { fontSize: "18px", opacity: 0.7 }
              }, "›")
            ])
          ])
        ))
      ]);
    };

    const renderSearchView = () => {
      return React.createElement("div", {
        style: { padding: "50px 20px 100px 20px" }
      }, [
        React.createElement("h2", { key: "title", style: { margin: "0 0 20px 0" } }, "Discover People"),
        React.createElement("input", {
          key: "search-input",
          type: "text",
          placeholder: "Search by name, company, or job title...",
          value: searchQuery,
          onChange: (e) => {
            setSearchQuery(e.target.value);
            searchPublicCards(e.target.value);
          },
          style: {
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "none",
            background: darkMode ? "rgba(55, 65, 81, 0.8)" : "rgba(243, 244, 246, 0.8)",
            fontSize: "16px",
            outline: "none",
            marginBottom: "20px"
          }
        }),
        searchResults.map(result => 
          React.createElement("div", {
            key: result.id,
            style: {
              background: darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(255, 255, 255, 0.8)",
              borderRadius: "15px",
              padding: "15px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }
          }, [
            React.createElement("div", { key: "info" }, [
              React.createElement("h4", {
                key: "name",
                style: { margin: "0 0 5px 0" }
              }, result.name),
              React.createElement("p", {
                key: "title",
                style: { margin: "0 0 3px 0", fontSize: "14px", opacity: 0.7 }
              }, result.title),
              React.createElement("p", {
                key: "company",
                style: { margin: "0", fontSize: "13px", opacity: 0.6 }
              }, result.companyName)
            ]),
            React.createElement("button", {
              key: "connect-btn",
              onClick: () => sendConnectionRequest(result.id),
              style: {
                background: "#007AFF",
                color: "white",
                border: "none",
                borderRadius: "20px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "14px"
              }
            }, "Connect")
          ])
        )
      ]);
    };

    const renderRequestsView = () => {
      const currentUser = employees[0];
      if (!currentUser) return React.createElement("p", {}, "Please create a profile first.");

      const incomingRequests = connectionRequests.filter(req => req.toEmployeeId === currentUser.id);

      return React.createElement("div", {
        style: { padding: "50px 20px 100px 20px" }
      }, [
        React.createElement("h2", { key: "title", style: { margin: "0 0 20px 0" } }, "Connection Requests"),
        incomingRequests.length === 0
          ? React.createElement("p", { key: "no-requests" }, "No pending requests.")
          : incomingRequests.map(request => 
              React.createElement("div", {
                key: request.id,
                style: {
                  background: darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(255, 255, 255, 0.8)",
                  borderRadius: "15px",
                  padding: "15px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              }, [
                React.createElement("div", { key: "request-info" }, [
                  React.createElement("h4", {
                    key: "name",
                    style: { margin: "0 0 5px 0" }
                  }, request.fromName),
                  React.createElement("p", {
                    key: "company",
                    style: { margin: "0", fontSize: "14px", opacity: 0.7 }
                  }, request.fromCompany)
                ]),
                React.createElement("div", {
                  key: "actions",
                  style: { display: "flex", gap: "10px" }
                }, [
                  React.createElement("button", {
                    key: "accept",
                    onClick: () => acceptConnectionRequest(request.id),
                    style: {
                      background: "#34D399",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }
                  }, "Accept"),
                  React.createElement("button", {
                    key: "decline",
                    onClick: () => rejectConnectionRequest(request.id),
                    style: {
                      background: "#F87171",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }
                  }, "Decline")
                ])
              ])
            )
      ]);
    };

    const renderBottomNavigation = () => {
      if (currentRole !== "employee") return null;

      const tabs = [
        { id: "wallet", label: "Wallet", icon: "👥" },
        { id: "search", label: "Discover", icon: "🔍" },
        { id: "requests", label: "Requests", icon: "📩" }
      ];

      return React.createElement("div", {
        style: {
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: darkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          padding: "10px 0 30px 0",
          borderTop: `1px solid ${darkMode ? "rgba(55, 65, 81, 0.3)" : "rgba(229, 231, 235, 0.8)"}`,
          display: "flex",
          justifyContent: "space-around",
          zIndex: 100
        }
      }, tabs.map(tab =>
        React.createElement("button", {
          key: tab.id,
          onClick: () => setActiveTab(tab.id),
          style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: activeTab === tab.id ? "#007AFF" : (darkMode ? "#9CA3AF" : "#6B7280"),
            fontSize: "28px",
            padding: "10px"
          }
        }, React.createElement("span", { key: "icon" }, tab.icon))
      ));
    };

    const renderLoginScreen = () => {
      return React.createElement("div", {
        style: {
          minHeight: "100vh",
          background: darkMode ? "#111827" : "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }
      }, [
        React.createElement("div", {
          key: "login-container",
          className: "glass",
          style: {
            maxWidth: "400px",
            width: "100%",
            textAlign: "center"
          }
        }, [
          React.createElement("div", {
            key: "logo-section",
            style: { marginBottom: "2rem" }
          }, [
            React.createElement("h1", {
              key: "logo-title",
              style: {
                fontSize: "2.5rem",
                fontWeight: "700",
                background: "linear-gradient(90deg, #6366f1, #9333ea)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                margin: "0 0 0.5rem 0"
              }
            }, "Business Card Studio"),
            React.createElement("p", {
              key: "subtitle",
              style: {
                color: darkMode ? "#9CA3AF" : "#6B7280",
                fontSize: "1rem",
                margin: 0
              }
            }, "Connect professionally, share instantly")
          ]),
          
          React.createElement("div", {
            key: "login-form",
            style: { marginBottom: "1.5rem" }
          }, [
            React.createElement("input", {
              key: "username",
              type: "text",
              placeholder: "Username",
              value: loginUsername,
              onChange: (e) => setLoginUsername(e.target.value),
              onKeyPress: (e) => e.key === "Enter" && handleLogin(),
              style: {
                width: "100%",
                padding: "12px 16px",
                marginBottom: "1rem",
                borderRadius: "12px",
                border: "none",
                background: darkMode ? "rgba(55, 65, 81, 0.8)" : "rgba(255, 255, 255, 0.8)",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box"
              }
            }),
            React.createElement("input", {
              key: "password",
              type: "password",
              placeholder: "Password",
              value: loginPassword,
              onChange: (e) => setLoginPassword(e.target.value),
              onKeyPress: (e) => e.key === "Enter" && handleLogin(),
              style: {
                width: "100%",
                padding: "12px 16px",
                marginBottom: "1.5rem",
                borderRadius: "12px",
                border: "none",
                background: darkMode ? "rgba(55, 65, 81, 0.8)" : "rgba(255, 255, 255, 0.8)",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box"
              }
            }),
            React.createElement("button", {
              key: "login-btn",
              onClick: handleLogin,
              className: "gradient-btn",
              style: {
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "1rem"
              }
            }, "Sign In")
          ]),
          
          React.createElement("button", {
            key: "theme-toggle",
            onClick: toggleDarkMode,
            style: {
              background: "none",
              border: "none",
              color: darkMode ? "#9CA3AF" : "#6B7280",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              margin: "0 auto"
            }
          }, [
            React.createElement("span", { key: "icon" }, darkMode ? "☀️" : "🌙"),
            React.createElement("span", { key: "text" }, darkMode ? "Light Mode" : "Dark Mode")
          ])
        ])
      ]);
    };

    const renderEmployeeView = () => {
      return React.createElement("div", {
        style: {
          minHeight: "100vh",
          background: darkMode ? "#111827" : "#f9fafb"
        }
      }, [
        // Header with hamburger menu
        React.createElement("div", {
          key: "header",
          style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: darkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 200,
            borderBottom: `1px solid ${darkMode ? "rgba(55, 65, 81, 0.3)" : "rgba(229, 231, 235, 0.8)"}`
          }
        }, [
          React.createElement("button", {
            key: "menu-btn",
            onClick: () => setShowMenu(!showMenu),
            style: {
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: darkMode ? "#f3f4f6" : "#374151"
            }
          }, "☰"),
          React.createElement("h1", {
            key: "title",
            style: {
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: darkMode ? "#f3f4f6" : "#374151"
            }
          }, activeTab === "wallet" ? "Contacts" : activeTab === "search" ? "Discover" : "Requests"),
          React.createElement("div", { key: "spacer", style: { width: "20px" } })
        ]),

        // Overlay for menu
        showMenu && React.createElement("div", {
          key: "overlay",
          onClick: () => setShowMenu(false),
          style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 999
          }
        }),

        // Hamburger menu
        renderHamburgerMenu(),

        // Main content based on active tab
        activeTab === "wallet" && renderWalletView(),
        activeTab === "search" && renderSearchView(),
        activeTab === "requests" && renderRequestsView(),

        // Bottom navigation
        renderBottomNavigation()
      ]);
    };

    const renderCompanyView = () => {
      return React.createElement("div", { className: "glass", style: { maxWidth: "500px", width: "100%" } }, [
        React.createElement("h2", { key: "title" }, "🏢 Company Portal"),
        React.createElement("p", { key: "description" }, "Place an order for business card designs"),
        React.createElement("input", {
          key: "company-name",
          type: "text",
          placeholder: "Company Name",
          value: companyName,
          onChange: (e) => setCompanyName(e.target.value)
        }),
        React.createElement("input", {
          key: "brand-colors",
          type: "text",
          placeholder: "Brand Colors (e.g., #4f46e5, #9333ea)",
          value: brandColors,
          onChange: (e) => setBrandColors(e.target.value)
        }),
        React.createElement("input", {
          key: "logo",
          type: "text",
          placeholder: "Logo URL (optional)",
          value: logo,
          onChange: (e) => setLogo(e.target.value)
        }),
        React.createElement("button", {
          key: "submit",
          className: "gradient-btn",
          onClick: handleCompanySubmit,
          disabled: !companyName || !brandColors
        }, "Place Order"),
        
        React.createElement("div", { key: "orders-list", style: { marginTop: "2rem" } }, [
          React.createElement("h3", { key: "orders-title" }, "My Orders"),
          orders.length === 0 
            ? React.createElement("p", { key: "no-orders" }, "No orders placed yet.")
            : orders.map(order => 
                React.createElement("div", {
                  key: order.id,
                  style: { 
                    background: "#f3f4f6", 
                    padding: "1rem", 
                    margin: "0.5rem 0", 
                    borderRadius: "0.5rem",
                    border: `2px solid ${order.status === 'pending' ? '#fbbf24' : '#10b981'}`
                  }
                }, [
                  React.createElement("strong", { key: "company" }, order.companyName),
                  React.createElement("span", { 
                    key: "status",
                    style: { 
                      float: "right", 
                      background: order.status === 'pending' ? '#fbbf24' : '#10b981',
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.8rem"
                    }
                  }, order.status.toUpperCase())
                ])
              )
        ])
      ]);
    };

    const renderDesignerView = () => {
      const pendingOrders = orders.filter(order => order.status === "pending");
      
      return React.createElement("div", { className: "glass", style: { maxWidth: "500px", width: "100%" } }, [
        React.createElement("h2", { key: "title" }, "🎨 Designer Portal"),
        React.createElement("p", { key: "description" }, "Create designs for pending orders"),
        
        pendingOrders.length === 0 
          ? React.createElement("p", { key: "no-pending" }, "No pending orders to design.")
          : [
              React.createElement("select", {
                key: "order-select",
                value: selectedOrder,
                onChange: (e) => setSelectedOrder(e.target.value)
              }, [
                React.createElement("option", { key: "default", value: "" }, "Select an order"),
                ...pendingOrders.map(order => 
                  React.createElement("option", { key: order.id, value: order.id }, 
                    `${order.companyName} - ${order.createdAt}`
                  )
                )
              ]),
              
              selectedOrder && React.createElement("div", { key: "order-details", style: { background: "#f3f4f6", padding: "1rem", borderRadius: "0.5rem", margin: "1rem 0" } }, [
                React.createElement("h4", { key: "details-title" }, "Order Details"),
                React.createElement("p", { key: "company" }, `Company: ${orders.find(o => o.id === parseInt(selectedOrder))?.companyName}`),
                React.createElement("p", { key: "colors" }, `Brand Colors: ${orders.find(o => o.id === parseInt(selectedOrder))?.brandColors}`)
              ]),
              
              React.createElement("textarea", {
                key: "template",
                placeholder: "Enter design template details...",
                value: designTemplate,
                onChange: (e) => setDesignTemplate(e.target.value),
                rows: 4
              }),
              
              React.createElement("button", {
                key: "submit",
                className: "gradient-btn",
                onClick: handleDesignSubmit,
                disabled: !selectedOrder || !designTemplate
              }, "Submit Design")
            ]
      ]);
    };

    const renderHRView = () => {
      const availableDesigns = designs.map(design => ({
        ...design,
        order: orders.find(order => order.id === design.orderId)
      }));
      
      return React.createElement("div", { className: "glass", style: { maxWidth: "500px", width: "100%" } }, [
        React.createElement("h2", { key: "title" }, "👥 HR Portal"),
        React.createElement("p", { key: "description" }, "Assign business cards to employees"),
        
        availableDesigns.length === 0 
          ? React.createElement("p", { key: "no-designs" }, "No designs available yet.")
          : [
              React.createElement("select", {
                key: "design-select",
                value: selectedDesign,
                onChange: (e) => setSelectedDesign(e.target.value)
              }, [
                React.createElement("option", { key: "default", value: "" }, "Select a design"),
                ...availableDesigns.map(design => 
                  React.createElement("option", { key: design.id, value: design.id }, 
                    `${design.order.companyName} - ${design.createdAt}`
                  )
                )
              ]),
              
              React.createElement("input", {
                key: "emp-name",
                type: "text",
                placeholder: "Employee Name",
                value: employeeName,
                onChange: (e) => setEmployeeName(e.target.value)
              }),
              
              React.createElement("input", {
                key: "emp-title",
                type: "text",
                placeholder: "Job Title",
                value: employeeTitle,
                onChange: (e) => setEmployeeTitle(e.target.value)
              }),
              
              React.createElement("input", {
                key: "emp-email",
                type: "email",
                placeholder: "Email Address",
                value: employeeEmail,
                onChange: (e) => setEmployeeEmail(e.target.value)
              }),
              
              React.createElement("input", {
                key: "emp-phone",
                type: "tel",
                placeholder: "Phone Number (optional)",
                value: employeePhone,
                onChange: (e) => setEmployeePhone(e.target.value)
              }),
              
              React.createElement("button", {
                key: "submit",
                className: "gradient-btn",
                onClick: handleHRSubmit,
                disabled: !selectedDesign || !employeeName || !employeeTitle || !employeeEmail
              }, "Assign Card to Employee")
            ]
      ]);
    };

    if (!isLoggedIn) {
      return renderLoginScreen();
    }

    if (currentRole === "employee") {
      return renderEmployeeView();
    }

    return React.createElement("div", { className: "container" }, [
      React.createElement("button", {
        key: "theme-toggle",
        onClick: toggleDarkMode,
        className: "gradient-btn",
        style: { width: "auto", padding: "0.5rem 1rem", marginBottom: "1rem" }
      }, darkMode ? "☀️ Light" : "🌙 Dark"),
      
      React.createElement("h1", { key: "main-title" }, "Business Card Studio"),
      
      React.createElement("div", {
        key: "role-selector",
        className: "glass",
        style: { maxWidth: "500px", width: "100%", marginBottom: "2rem" }
      }, [
        React.createElement("label", { key: "role-label" }, "Select Role"),
        React.createElement("select", {
          key: "role-select",
          value: currentRole,
          onChange: (e) => setCurrentRole(e.target.value)
        }, [
          React.createElement("option", { key: "company", value: "company" }, "🏢 Company"),
          React.createElement("option", { key: "designer", value: "designer" }, "🎨 Designer"),
          React.createElement("option", { key: "hr", value: "hr" }, "👥 HR"),
          React.createElement("option", { key: "employee", value: "employee" }, "👤 Employee")
        ])
      ]),
      
      currentRole === "company" && renderCompanyView(),
      currentRole === "designer" && renderDesignerView(),
      currentRole === "hr" && renderHRView()
    ]);
  }

  ReactDOM.render(React.createElement(App), document.getElementById("root"));

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
})();
