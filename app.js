
(function() {
  const { useState, useEffect } = React;
  const { motion, AnimatePresence } = window.FramerMotion || {
    motion: { div: "div", h1: "h1", li: "li", button: "button" },
    AnimatePresence: ({ children }) => children
  };

  function App() {
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
    const [activeTab, setActiveTab] = useState("my-cards");
    
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
    }, []);

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

    const generateShareCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
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
      const currentUser = employees[0]; // Assuming first employee is current user
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
      
      // Find all connections for this employee
      const userConnections = connections.filter(conn => 
        conn.employeeId1 === employeeId || conn.employeeId2 === employeeId
      );
      
      // In a real app, you'd send notifications to all connected users
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
      
      // Update order status
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
        isPublic: false, // Default to private
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

    const renderTabNavigation = () => {
      const tabs = [
        { id: "my-cards", label: "My Cards", icon: "👤" },
        { id: "search", label: "Search", icon: "🔍" },
        { id: "connections", label: "Connections", icon: "🤝" },
        { id: "requests", label: "Requests", icon: "📩" },
        { id: "receive", label: "Receive Card", icon: "📇" }
      ];

      return React.createElement("div", {
        style: {
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          flexWrap: "wrap"
        }
      }, tabs.map(tab =>
        React.createElement("button", {
          key: tab.id,
          onClick: () => setActiveTab(tab.id),
          style: {
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            background: activeTab === tab.id ? "linear-gradient(90deg, #4f46e5, #9333ea)" : "rgba(255,255,255,0.2)",
            color: activeTab === tab.id ? "white" : darkMode ? "#f3f4f6" : "#374151",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500"
          }
        }, `${tab.icon} ${tab.label}`)
      ));
    };

    const renderMyCards = () => {
      return React.createElement("div", {}, [
        React.createElement("h3", { key: "title" }, "My Business Cards"),
        employees.length === 0 
          ? React.createElement("p", { key: "no-cards" }, "No cards assigned yet. Contact HR to get your business card.")
          : employees.map(employee => 
              React.createElement("div", {
                key: employee.id,
                className: "glass",
                style: { 
                  margin: "1rem 0", 
                  padding: "1rem",
                  background: `linear-gradient(135deg, ${employee.brandColors || '#6366f1, #9333ea'})`
                }
              }, [
                React.createElement("div", {
                  key: "card-header",
                  style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }
                }, [
                  React.createElement("h4", { key: "name", style: { color: "white", margin: "0" } }, employee.name),
                  React.createElement("div", { key: "actions", style: { display: "flex", gap: "0.5rem" } }, [
                    React.createElement("button", {
                      key: "visibility-btn",
                      onClick: () => toggleProfileVisibility(employee.id),
                      style: {
                        background: "rgba(255,255,255,0.2)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "0.25rem",
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }
                    }, employee.isPublic ? "🌍 Public" : "🔒 Private"),
                    React.createElement("button", {
                      key: "update-job-btn",
                      onClick: () => {
                        const newCompany = prompt("New company name:", employee.companyName);
                        const newTitle = prompt("New job title:", employee.title);
                        if (newCompany && newTitle) {
                          updateJobAndNotifyConnections(employee.id, newCompany, newTitle);
                        }
                      },
                      style: {
                        background: "rgba(255,255,255,0.2)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "0.25rem",
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }
                    }, "💼 Update Job")
                  ])
                ]),
                React.createElement("p", { key: "title", style: { color: "white", margin: "0 0 0.5rem 0" } }, employee.title),
                React.createElement("p", { key: "company", style: { color: "white", margin: "0 0 0.5rem 0" } }, employee.companyName),
                React.createElement("p", { key: "email", style: { color: "white", margin: "0 0 0.5rem 0" } }, employee.email),
                employee.phone && React.createElement("p", { key: "phone", style: { color: "white", margin: "0 0 1rem 0" } }, employee.phone),
                React.createElement("div", { key: "share-info", style: { borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: "1rem" } }, [
                  React.createElement("p", { key: "share-text", style: { color: "white", margin: "0 0 0.5rem 0", fontSize: "0.9rem" } }, "Share Code:"),
                  React.createElement("div", { key: "share-actions", style: { display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" } }, [
                    React.createElement("code", { key: "share-code", style: { color: "white", background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "1.1rem", fontWeight: "bold" } }, employee.shareCode),
                    React.createElement("button", {
                      key: "copy-btn",
                      onClick: () => {
                        navigator.clipboard.writeText(employee.shareCode).then(() => {
                          alert("Share code copied to clipboard!");
                        }).catch(() => {
                          const textArea = document.createElement("textarea");
                          textArea.value = employee.shareCode;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          alert("Share code copied to clipboard!");
                        });
                      },
                      style: { 
                        background: "rgba(255,255,255,0.2)", 
                        color: "white", 
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }
                    }, "📋 Copy"),
                    React.createElement("button", {
                      key: "share-btn",
                      onClick: () => {
                        if (navigator.share) {
                          navigator.share({
                            title: `${employee.name}'s Business Card`,
                            text: `Here's my business card! Use code: ${employee.shareCode}`,
                            url: window.location.href
                          });
                        } else {
                          const shareText = `Here's my business card! Use code: ${employee.shareCode} at ${window.location.href}`;
                          const emailSubject = `${employee.name}'s Business Card`;
                          const emailBody = encodeURIComponent(shareText);
                          const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
                          window.open(mailtoLink);
                        }
                      },
                      style: { 
                        background: "rgba(255,255,255,0.2)", 
                        color: "white", 
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }
                    }, "📤 Share")
                  ])
                ])
              ])
            )
      ]);
    };

    const renderSearch = () => {
      return React.createElement("div", {}, [
        React.createElement("h3", { key: "title" }, "Search Public Profiles"),
        React.createElement("p", { key: "description", style: { color: darkMode ? "#d1d5db" : "#6b7280", marginBottom: "1rem" } }, "Discover professionals from other companies:"),
        React.createElement("input", {
          key: "search-input",
          type: "text",
          placeholder: "Search by name, company, or job title...",
          value: searchQuery,
          onChange: (e) => {
            setSearchQuery(e.target.value);
            searchPublicCards(e.target.value);
          }
        }),
        searchResults.length > 0 && React.createElement("div", { key: "results", style: { marginTop: "1rem" } }, [
          React.createElement("h4", { key: "results-title" }, `Found ${searchResults.length} results:`),
          searchResults.map(result => 
            React.createElement("div", {
              key: result.id,
              className: "glass",
              style: { 
                margin: "1rem 0", 
                padding: "1rem",
                background: `linear-gradient(135deg, ${result.brandColors || '#6366f1, #9333ea'})`
              }
            }, [
              React.createElement("div", {
                key: "result-header",
                style: { display: "flex", justifyContent: "space-between", alignItems: "center" }
              }, [
                React.createElement("div", { key: "info" }, [
                  React.createElement("h4", { key: "name", style: { color: "white", margin: "0 0 0.5rem 0" } }, result.name),
                  React.createElement("p", { key: "title", style: { color: "white", margin: "0 0 0.25rem 0" } }, result.title),
                  React.createElement("p", { key: "company", style: { color: "white", margin: "0", fontSize: "0.9rem" } }, result.companyName)
                ]),
                React.createElement("button", {
                  key: "connect-btn",
                  onClick: () => sendConnectionRequest(result.id),
                  style: {
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }
                }, "🤝 Connect")
              ])
            ])
          )
        ])
      ]);
    };

    const renderConnections = () => {
      const currentUser = employees[0];
      if (!currentUser) return React.createElement("p", {}, "Please create a profile first.");

      const userConnections = connections.filter(conn => 
        conn.employeeId1 === currentUser.id || conn.employeeId2 === currentUser.id
      ).map(conn => {
        const connectedEmployeeId = conn.employeeId1 === currentUser.id ? conn.employeeId2 : conn.employeeId1;
        return employees.find(emp => emp.id === connectedEmployeeId);
      }).filter(Boolean);

      return React.createElement("div", {}, [
        React.createElement("h3", { key: "title" }, `My Connections (${userConnections.length})`),
        userConnections.length === 0
          ? React.createElement("p", { key: "no-connections" }, "No connections yet. Search for people to connect with!")
          : userConnections.map(connection => 
              React.createElement("div", {
                key: connection.id,
                className: "glass",
                style: { margin: "1rem 0", padding: "1rem" }
              }, [
                React.createElement("h4", { key: "name", style: { margin: "0 0 0.5rem 0" } }, connection.name),
                React.createElement("p", { key: "title", style: { margin: "0 0 0.25rem 0" } }, connection.title),
                React.createElement("p", { key: "company", style: { margin: "0 0 0.5rem 0", color: darkMode ? "#d1d5db" : "#6b7280" } }, connection.companyName),
                React.createElement("p", { key: "email", style: { margin: "0", fontSize: "0.9rem" } }, connection.email)
              ])
            )
      ]);
    };

    const renderRequests = () => {
      const currentUser = employees[0];
      if (!currentUser) return React.createElement("p", {}, "Please create a profile first.");

      const incomingRequests = connectionRequests.filter(req => req.toEmployeeId === currentUser.id);
      const outgoingRequests = connectionRequests.filter(req => req.fromEmployeeId === currentUser.id);

      return React.createElement("div", {}, [
        React.createElement("h3", { key: "incoming-title" }, `Incoming Requests (${incomingRequests.length})`),
        incomingRequests.length === 0
          ? React.createElement("p", { key: "no-incoming" }, "No incoming connection requests.")
          : incomingRequests.map(request => 
              React.createElement("div", {
                key: request.id,
                className: "glass",
                style: { margin: "1rem 0", padding: "1rem" }
              }, [
                React.createElement("div", {
                  key: "request-content",
                  style: { display: "flex", justifyContent: "space-between", alignItems: "center" }
                }, [
                  React.createElement("div", { key: "request-info" }, [
                    React.createElement("h4", { key: "name", style: { margin: "0 0 0.25rem 0" } }, request.fromName),
                    React.createElement("p", { key: "company", style: { margin: "0", color: darkMode ? "#d1d5db" : "#6b7280" } }, request.fromCompany)
                  ]),
                  React.createElement("div", { key: "request-actions", style: { display: "flex", gap: "0.5rem" } }, [
                    React.createElement("button", {
                      key: "accept-btn",
                      onClick: () => acceptConnectionRequest(request.id),
                      style: {
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        padding: "0.5rem 1rem",
                        cursor: "pointer"
                      }
                    }, "✅ Accept"),
                    React.createElement("button", {
                      key: "reject-btn",
                      onClick: () => rejectConnectionRequest(request.id),
                      style: {
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        padding: "0.5rem 1rem",
                        cursor: "pointer"
                      }
                    }, "❌ Decline")
                  ])
                ])
              ])
            ),
        
        React.createElement("h3", { key: "outgoing-title", style: { marginTop: "2rem" } }, `Sent Requests (${outgoingRequests.length})`),
        outgoingRequests.length === 0
          ? React.createElement("p", { key: "no-outgoing" }, "No outgoing connection requests.")
          : outgoingRequests.map(request => {
              const targetEmployee = employees.find(emp => emp.id === request.toEmployeeId);
              return React.createElement("div", {
                key: request.id,
                className: "glass",
                style: { margin: "1rem 0", padding: "1rem" }
              }, [
                React.createElement("div", {
                  key: "sent-info",
                  style: { display: "flex", justifyContent: "space-between", alignItems: "center" }
                }, [
                  React.createElement("div", { key: "target-info" }, [
                    React.createElement("h4", { key: "name", style: { margin: "0 0 0.25rem 0" } }, targetEmployee?.name || "Unknown"),
                    React.createElement("p", { key: "company", style: { margin: "0", color: darkMode ? "#d1d5db" : "#6b7280" } }, targetEmployee?.companyName || "Unknown Company")
                  ]),
                  React.createElement("span", {
                    key: "status",
                    style: {
                      background: "#fbbf24",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.8rem"
                    }
                  }, "⏳ Pending")
                ])
              ]);
            })
      ]);
    };

    const renderReceiveCard = () => {
      return React.createElement("div", {}, [
        React.createElement("h3", { key: "title" }, "Receive Someone's Card"),
        React.createElement("p", { key: "description", style: { color: darkMode ? "#d1d5db" : "#6b7280", marginBottom: "1rem" } }, "Enter a share code to view someone's business card:"),
        React.createElement("input", {
          key: "share-input",
          type: "text",
          placeholder: "Enter share code (e.g., ABC123XY)",
          value: shareCode,
          onChange: (e) => setShareCode(e.target.value.toUpperCase()),
          style: { textTransform: "uppercase" }
        }),
        React.createElement("button", {
          key: "lookup-btn",
          className: "gradient-btn",
          onClick: handleShareCodeLookup,
          disabled: !shareCode.trim()
        }, "View Card"),
        
        viewedCard && React.createElement("div", {
          key: "viewed-card",
          className: "glass",
          style: { 
            margin: "2rem 0 0 0", 
            padding: "1.5rem",
            background: `linear-gradient(135deg, ${viewedCard.brandColors || '#6366f1, #9333ea'})`
          }
        }, [
          React.createElement("h4", { key: "viewed-title", style: { color: "white", margin: "0 0 1rem 0" } }, "📇 Received Business Card"),
          React.createElement("h3", { key: "viewed-name", style: { color: "white", margin: "0 0 0.5rem 0" } }, viewedCard.name),
          React.createElement("p", { key: "viewed-jobtitle", style: { color: "white", margin: "0 0 0.5rem 0" } }, viewedCard.title),
          React.createElement("p", { key: "viewed-company", style: { color: "white", margin: "0 0 0.5rem 0" } }, viewedCard.companyName),
          React.createElement("p", { key: "viewed-email", style: { color: "white", margin: "0 0 0.5rem 0" } }, viewedCard.email),
          viewedCard.phone && React.createElement("p", { key: "viewed-phone", style: { color: "white", margin: "0" } }, viewedCard.phone),
          React.createElement("button", {
            key: "close-btn",
            onClick: () => setViewedCard(null),
            style: { 
              marginTop: "1rem", 
              background: "rgba(255,255,255,0.2)", 
              color: "white", 
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              cursor: "pointer"
            }
          }, "Close")
        ])
      ]);
    };

    const renderEmployeeView = () => {
      return React.createElement("div", { className: "glass", style: { maxWidth: "800px", width: "100%" } }, [
        React.createElement("h2", { key: "title" }, "👤 Employee Portal"),
        renderTabNavigation(),
        activeTab === "my-cards" && renderMyCards(),
        activeTab === "search" && renderSearch(),
        activeTab === "connections" && renderConnections(),
        activeTab === "requests" && renderRequests(),
        activeTab === "receive" && renderReceiveCard()
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
        
        // Orders List
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
      currentRole === "hr" && renderHRView(),
      currentRole === "employee" && renderEmployeeView()
    ]);
  }

  ReactDOM.render(React.createElement(App), document.getElementById("root"));

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
})();
