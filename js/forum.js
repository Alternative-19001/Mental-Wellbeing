// Wrap everything in an IIFE to avoid global scope pollution
(function () {
    let db;
    let finalData = { comments: [] };
    let currentUser = null;
    let isRefreshing = false;

    // DOM Elements
    const commentsContainer = document.querySelector(".interactive-comments");
    const getElement = (selector) => document.querySelector(selector);
    const getAllElements = (selector) =>
        commentsContainer.querySelectorAll(selector);

    const loginUsernameInput = document.querySelector("#login-username");
    const loginButton = document.querySelector("#login-btn");
    const logoutButton = getElement("#logout-btn");
    const commentInputSection = getElement("#comment-input-section");
    const commentTextarea = getElement(".reply-input .cmnt-input");
    
    // Wait for Firebase to load
    function setupFirebase() {
        if (window.db) {
            db = window.db;
            console.log("Firebase already available, initializing...");
            init();
        } else {
            console.log("Waiting for Firebase to load...");
            document.addEventListener('firebaseLoaded', () => {
                console.log("Firebase loaded event received");
                db = window.db;
                init();
            });
            
            // Add a timeout fallback in case the Firebase loaded event never fires
            setTimeout(() => {
                if (!db && window.db) {
                    console.log("Using timeout fallback for Firebase initialization");
                    db = window.db;
                    init();
                } else if (!db) {
                    console.error("Firebase failed to initialize after timeout");
                    createPopup("Failed to connect to database", "error");
                }
            }, 5000);
        }
    }
    
    // Load data from Firestore
    async function loadData() {
        try {
            if (!db) {
                console.error("Firebase not initialized");
                createPopup("Database connection not available", "error");
                return { comments: [] };
            }
            
            if (isRefreshing) {
                console.log("Already refreshing data, skipping duplicate request");
                return finalData;
            }
            
            isRefreshing = true;
            console.log("Starting to load comments...");
            
            try {
                const commentsSnapshot = await window.firebase.getDocs(window.firebase.collection(db, "comments"));
                console.log("Comments query executed successfully");
                
                const commentsData = [];
                
                commentsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    commentsData.push({
                        _id: doc.id,
                        ...data
                    });
                });
                
                console.log(`Loaded ${commentsData.length} comments`);
                finalData = { comments: commentsData };
                isRefreshing = false;
                return finalData;
            } catch (firestoreError) {
                console.error("Firestore query error:", firestoreError);
                createPopup("Failed to query comments database", "error");
                isRefreshing = false;
                return { comments: [] };
            }
        } catch (error) {
            console.error("Error in loadData function:", error);
            createPopup("Failed to load comments (general error)", "error");
            isRefreshing = false;
            return { comments: [] };
        }
    }
    
    // Utility to create popup notifications
    function createPopup(message, type = "info") {
        const popup = document.createElement("div");
        popup.className = `popup ${type}`;
        popup.textContent = message;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.classList.add("show");
            
            setTimeout(() => {
                popup.classList.remove("show");
                setTimeout(() => popup.remove(), 300);
            }, 3000);
        }, 100);
    }
    
    // Add a loading spinner animation
    function createLoadingSpinner(parent, message = "Loading comments...") {
        // Remove any existing loading indicators first
        const existingLoaders = parent.querySelectorAll(".loading-comments");
        existingLoaders.forEach(loader => loader.remove());
        
        const loadingContainer = document.createElement("div");
        loadingContainer.className = "loading-comments";
        
        loadingContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-circle"></div>
                <div class="spinner-circle"></div>
                <div class="spinner-circle"></div>
            </div>
            <div class="loading-text">${message}</div>
        `;
        
        parent.appendChild(loadingContainer);
        
        // Add necessary styles if they don't exist
        if (!document.getElementById('loading-spinner-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'loading-spinner-styles';
            styleElement.textContent = `
                .loading-comments {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 2rem;
                    text-align: center;
                }
                
                .loading-spinner {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1rem;
                }
                
                .spinner-circle {
                    width: 12px;
                    height: 12px;
                    margin: 0 6px;
                    border-radius: 50%;
                    background-color: #6c757d;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                
                .spinner-circle:nth-child(1) {
                    animation-delay: -0.32s;
                }
                
                .spinner-circle:nth-child(2) {
                    animation-delay: -0.16s;
                }
                
                .loading-text {
                    color: #6c757d;
                    font-size: 0.9rem;
                }
                
                .no-comments {
                    text-align: center;
                    padding: 2rem;
                    color: #6c757d;
                }
                
                @keyframes bounce {
                    0%, 80%, 100% { 
                        transform: scale(0);
                    } 
                    40% { 
                        transform: scale(1.0);
                    }
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        return loadingContainer;
    }
    
    function appendFrag(frag, parent) {
        const insertedElement = frag.firstElementChild;
        
        parent.appendChild(frag);
        

        return parent.lastElementChild || parent.querySelector(`[data-id="${insertedElement?.dataset?.id}"]`);
    }
    
    // Add a comment to Firestore
    async function addComment(content, parentId = 0, replyingTo = null) {
        if (!currentUser) {
            createPopup("Please log in to comment", "error");
            return;
        }
        
        try {
            // Show a temporary "Sending..." state
            createPopup("Sending comment...", "info");
            
            const commentData = {
                content,
                createdAt: window.firebase.serverTimestamp(),
                parent: parentId,
                score: 0,
                user: {
                    username: currentUser.username,
                    image: currentUser.image
                }
            };
            
            if (replyingTo) {
                commentData.replyingTo = replyingTo;
            }
            
            const docRef = await window.firebase.addDoc(window.firebase.collection(db, "comments"), commentData);
            console.log("Comment added with ID:", docRef.id);
            createPopup("Comment added successfully", "success");
            
            const newComment = {
                _id: docRef.id,
                ...commentData
            };
            
            if (newComment.createdAt && typeof newComment.createdAt.toDate === 'function') {
                newComment.createdAt = newComment.createdAt.toDate();
            }
            
            finalData.comments.push(newComment);
            
            // Just update the comments without reloading data
            await initComments();
        } catch (error) {
            console.error("Error adding comment:", error);
            createPopup("Failed to add comment", "error");
        }
    }
    
    // Handle voting
    async function handleVote(commentId, voteType) {
        if (!currentUser) {
            createPopup("Please log in to vote", "error");
            return;
        }
        
        try {
            // Optimistic UI update - update the score in the UI immediately
            const scoreElement = document.querySelector(`[data-id="comment-${commentId}"] .score-number`);
            let currentScore = 0;
            
            if (scoreElement) {
                currentScore = parseInt(scoreElement.textContent) || 0;
                if (voteType === "up") {
                    scoreElement.textContent = currentScore + 1;
                } else if (voteType === "down") {
                    scoreElement.textContent = Math.max(0, currentScore - 1);
                }
            }
            
            const commentRef = window.firebase.doc(db, "comments", commentId);
            const commentSnapshot = await window.firebase.getDocs(
                window.firebase.query(
                    window.firebase.collection(db, "comments"), 
                    window.firebase.where("__name__", "==", commentId)
                )
            );
            
            if (commentSnapshot.empty) {
                createPopup("Comment not found", "error");
                return;
            }
            
            const commentData = commentSnapshot.docs[0].data();
            let newScore = commentData.score || 0;
            
            if (voteType === "up") {
                newScore += 1;
            } else if (voteType === "down") {
                newScore = Math.max(0, newScore - 1);
            }
            
            await window.firebase.updateDoc(commentRef, { score: newScore });
            console.log(`Vote ${voteType} applied to comment ${commentId}, new score: ${newScore}`);
            
            // Update the comment in our local data
            const comment = finalData.comments.find(c => c._id === commentId);
            if (comment) {
                comment.score = newScore;
            }
        } catch (error) {
            console.error("Error voting:", error);
            createPopup("Failed to vote", "error");
            
            await loadData();
            await initComments();
        }
    }
    
    // Delete comment prompt
    function promptDel(comment) {
        if (confirm(`Are you sure you want to delete this comment?`)) {
            deleteComment(comment._id);
        }
    }
    
    // Delete comment
    async function deleteComment(commentId) {
        try {
            // Show loading state
            createPopup("Deleting comment...", "info");
            
            const commentElement = document.querySelector(`[data-id="comment-${commentId}"]`);
            if (commentElement) {
                commentElement.style.opacity = "0.5";
            }
            
            await window.firebase.deleteDoc(window.firebase.doc(db, "comments", commentId));
            console.log(`Comment ${commentId} deleted`);
            createPopup("Comment deleted", "success");
            
            finalData.comments = finalData.comments.filter(c => c._id !== commentId);
            
            await initComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
            createPopup("Failed to delete comment", "error");
            
            // Reset UI in case of error
            if (commentElement) {
                commentElement.style.opacity = "1";
            }
        }
    }
    
    // Initialize current user from localStorage
    
    try {
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
    } catch (error) {
        console.error("Error loading user from localStorage:", error);
    }
    
    const createCommentNode = (commentData) => {
        try {
            const commentTemplate = getElement(".comment-template");
            if (!commentTemplate) {
                console.error("Comment template not found");
                return null;
            }

            const commentNode = commentTemplate.content.cloneNode(true);
            if (!commentNode) {
                console.error("Failed to clone comment template");
                return null;
            }

            const commentElement = commentNode.querySelector(".comment");
            if (!commentElement) {
                console.error("Comment element not found in template clone");
                return null;
            }
            
            // Add a unique data-id to help with finding the element after append
            commentElement.dataset.id = `comment-${commentData._id || Date.now()}`;

            // Set username with error handling
            const usernameElement = commentNode.querySelector(".usr-name");
            if (usernameElement && commentData.user && commentData.user.username) {
                usernameElement.textContent = commentData.user.username;
            } else {
                console.warn("Failed to set username", commentData);
            }

            // Set user image with error handling
            const userImageElement = commentNode.querySelector(".usr-img");
            if (userImageElement && commentData.user && commentData.user.image && commentData.user.image.png) {
                userImageElement.src = commentData.user.image.png;
            }

            // Set score with error handling
            const scoreElement = commentNode.querySelector(".score-number");
            if (scoreElement) {
                scoreElement.textContent = commentData.score || 0;
            }

            // Format the timestamp
            let formattedDate = "Just now";
            if (commentData.createdAt) {
                if (commentData.createdAt.toDate) {
                    // It's a Firestore timestamp
                    formattedDate = commentData.createdAt.toDate().toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                } else if (commentData.createdAt.seconds) {
                    // It's a serialized Firestore timestamp
                    formattedDate = new Date(commentData.createdAt.seconds * 1000).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                } else {
                    // Try as a regular date string
                    const date = new Date(commentData.createdAt);
                    if (!isNaN(date)) {
                        formattedDate = date.toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                    }
                }
            }
            
            const timeElement = commentNode.querySelector(".cmnt-at");
            if (timeElement) {
                timeElement.textContent = formattedDate;
            }

            const contentElement = commentNode.querySelector(".c-body");
            if (contentElement && commentData.content) {
                contentElement.textContent = commentData.content;
            }

            // Initially hide all control buttons
            const deleteButton = commentNode.querySelector(".delete");
            const editButton = commentNode.querySelector(".edit");
            const replyButton = commentNode.querySelector(".reply");
            
            // Only show reply button if user is logged in (handled by CSS)
            if (replyButton) {
                replyButton.addEventListener("click", () => {
                    if (!currentUser) {
                        createPopup("Please log in to reply", "error");
                        return;
                    }
                    
                    // Add pulse animation
                    replyButton.classList.add("reply-pulse");
                    
                    // Remove animation class after it completes
                    setTimeout(() => {
                        replyButton.classList.remove("reply-pulse");
                    }, 300);
                    
                    const parentElement =
                        commentNode.querySelector(".replies") ||
                        commentNode.parentElement;
                    
                    const existingReplyInput = parentElement.querySelector(".reply-input:not(.main-input)");
                    if (existingReplyInput) {
                        existingReplyInput.remove();
                        replyButton.classList.remove("reply-active");
                        return;
                    }
                    
                    replyButton.classList.add("reply-active");
                    
                    spawnReplyInput(
                        parentElement,
                        commentData._id,
                        commentData.user.username,
                        replyButton
                    );
                });
            }

            // Only show edit/delete for user's own comments
            if (
                currentUser &&
                commentData.user && 
                commentData.user.username === currentUser.username
            ) {
                commentElement.classList.add("this-user");

                if (deleteButton) {
                    deleteButton.addEventListener("click", () =>
                        promptDel(commentData),
                    );
                }

                if (editButton && contentElement) {
                    editButton.addEventListener("click", async () => {
                        const isEditing = contentElement.isContentEditable;
                        contentElement.contentEditable = !isEditing;
                        editButton.textContent = isEditing ? "Edit" : "Save";

                        if (isEditing) {
                            try {
                                await window.firebase.updateDoc(
                                    window.firebase.doc(db, "comments", commentData._id), 
                                    { content: contentElement.textContent }
                                );
                                
                                await loadData();
                                await initComments();
                                createPopup("Comment updated successfully", "success");
                            } catch (error) {
                                console.error("Error updating comment:", error);
                                createPopup("Failed to update comment", "error");
                                contentElement.textContent = commentData.content;
                            }
                        }
                    });
                }
            }

            // Add vote functionality with debug logs
            const scoreNumberElement = commentNode.querySelector(".score-number");
            const upvoteButton = commentNode.querySelector(".score-plus");
            const downvoteButton = commentNode.querySelector(".score-minus");

            if (scoreNumberElement) {
                scoreNumberElement.textContent = commentData.score || 0;
            }

            if (upvoteButton) {
                upvoteButton.addEventListener("click", async () => {
                    if (!currentUser) {
                        createPopup("Please log in to vote", "error");
                        return;
                    }
                    console.log("Upvoting comment:", commentData); // Debug log
                    await handleVote(commentData._id, "up");
                });
            }

            if (downvoteButton) {
                downvoteButton.addEventListener("click", async () => {
                    if (!currentUser) {
                        createPopup("Please log in to vote", "error");
                        return;
                    }
                    console.log("Downvoting comment:", commentData); // Debug log
                    await handleVote(commentData._id, "down");
                });
            }

            // Add hide replies button functionality
            const hideRepliesBtn = commentNode.querySelector(".hide-replies-btn");
            const repliesSection = commentNode.querySelector(".replies");

            if (hideRepliesBtn) {
                hideRepliesBtn.style.display = "none";
            }

            if (finalData.comments && finalData.comments.length > 0) {
                const hasReplies = finalData.comments.some(
                    (reply) => reply.parent === commentData._id,
                );

                if (hasReplies && hideRepliesBtn && repliesSection) {
                    hideRepliesBtn.style.display = "block";
                    repliesSection.style.display = "none";
                    hideRepliesBtn.textContent = "Show Replies";

                    hideRepliesBtn.addEventListener("click", () => {
                        const isHidden = repliesSection.style.display === "none";
                        
                        if (isHidden) {
                            repliesSection.style.opacity = "0";
                            repliesSection.style.display = "block";
                            repliesSection.style.maxHeight = "0";
                            
                            void repliesSection.offsetWidth;
                            
                            repliesSection.classList.add("animating");
                            hideRepliesBtn.textContent = "Hide Replies";
                            
                            setTimeout(() => {
                                repliesSection.classList.remove("animating");
                                repliesSection.style.opacity = "";
                                repliesSection.style.maxHeight = "";
                            }, 500); // Match the animation duration
                        } else {
                            repliesSection.style.opacity = "0";
                            repliesSection.style.transform = "translateY(-10px)";
                            
                            setTimeout(() => {
                                repliesSection.style.display = "none";
                                repliesSection.style.opacity = "";
                                repliesSection.style.transform = "";
                                hideRepliesBtn.textContent = "Show Replies";
                            }, 200);
                        }
                    });
                }
            }

            return commentNode;
        } catch (error) {
            console.error("Error creating comment node:", error, commentData);
            return null;
        }
    };

    // Spawn a reply input field
    function spawnReplyInput(parent, parentId, replyTo, replyButton) {
        // Check if there's already a reply input
        const existingInputs = parent.querySelectorAll(".reply-input:not(.main-input)");
        if (existingInputs.length > 0) {
            // Remove all existing reply inputs
            existingInputs.forEach(input => input.remove());
            // Remove active state from reply button
            replyButton.classList.remove("reply-active");
            return;
        }
        
        const replyInput = document.createElement("div");
        replyInput.className = "reply-input container";
        replyInput.innerHTML = `
            <img src="${currentUser?.image?.png || "images/user-image-with-black-background-svgrepo-com.svg"}" alt="avatar" class="usr-img">
            <textarea class="cmnt-input" placeholder="Reply to @${replyTo}...">@${replyTo} </textarea>
            <button class="bu-primary">REPLY</button>
        `;
        
        parent.appendChild(replyInput);
        const textarea = replyInput.querySelector(".cmnt-input");
        const sendButton = replyInput.querySelector(".bu-primary");
        
        // Focus and place cursor at the end
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        
        sendButton.addEventListener("click", async () => {
            const commentBody = textarea.value.trim();
            if (!commentBody) {
                createPopup("Please enter a reply", "error");
                return;
            }
            
            await addComment(commentBody, parentId, replyTo);
            replyInput.remove();
            replyButton.classList.remove("reply-active");
        });
        
        // Add keypress event for Enter
        textarea.addEventListener("keydown", async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const commentBody = textarea.value.trim();
                if (!commentBody) {
                    createPopup("Please enter a reply", "error");
                    return;
                }
                await addComment(commentBody, parentId, replyTo);
                replyInput.remove();
                replyButton.classList.remove("reply-active");
            }
        });
    }

    const appendComment = (parentNode, commentNode, parentId) => {
        // Append the fragment and get a reference to the appended element
        const appendedCmnt = appendFrag(commentNode, parentNode);
        
        // Safety check to ensure we have a valid DOM element
        if (!appendedCmnt || typeof appendedCmnt.querySelector !== 'function') {
            console.error("Failed to append comment properly", parentId);
            return; // Exit early if we don't have a valid element
        }

        const replyButton = appendedCmnt.querySelector(".reply");

        if (replyButton) {
            // Get the username, add error handling
            let replyTo = "";
            const usernameEl = appendedCmnt.querySelector(".usr-name");
            if (usernameEl) {
                replyTo = usernameEl.textContent;
            }

            replyButton.addEventListener("click", () => {
                if (parentNode.classList.contains("replies")) {
                    spawnReplyInput(parentNode, parentId, replyTo, replyButton);
                } else {
                    const repliesSection = appendedCmnt.querySelector(".replies");
                    if (repliesSection) {
                        spawnReplyInput(repliesSection, parentId, replyTo, replyButton);
                    }
                }
            });
        }
    };

    async function initComments(commentList = null, parent = null) {
        try {
            // Make sure we have a valid parent
            if (!parent) {
                parent = document.querySelector(".comments-wrp");
                if (!parent) {
                    console.error("Comments wrapper not found");
                    return;
                }
            }
            
            // Show loading animation only on first load or when parent is empty
            if (!commentList && !parent.querySelector(".comment")) {
                // Create loading spinner instead of simple text
                createLoadingSpinner(parent);
            }
            
            if (!commentList) {
                // If finalData already has comments, use them instead of reloading
                if (finalData.comments && finalData.comments.length > 0) {
                    commentList = finalData.comments.filter(
                        (comment) => !comment.parent || comment.parent === 0,
                    );
                } else {
                    const data = await loadData();
                    commentList = data.comments.filter(
                        (comment) => !comment.parent || comment.parent === 0,
                    );
                }
                
                // Sort comments to show newest first (based on createdAt timestamp)
                commentList.sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        // Handle Firestore timestamps
                        const aDate = a.createdAt.toDate ? a.createdAt.toDate() : 
                                     (a.createdAt.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt));
                        const bDate = b.createdAt.toDate ? b.createdAt.toDate() : 
                                     (b.createdAt.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt));
                        return bDate - aDate;
                    }
                    return 0;
                });
            }

            if (!parent) {
                console.error("Parent element for comments not found");
                return;
            }

            // Remove loading indicator if it exists
            const loadingIndicator = parent.querySelector(".loading-comments");
            if (loadingIndicator) {
                parent.removeChild(loadingIndicator);
            }
            
            // Only clear the parent container if this is a main comments refresh
            if (parent.classList.contains("comments-wrp")) {
                parent.innerHTML = "";
            }
            
            if (!commentList || commentList.length === 0) {
                console.log("No comments to display");
                // Show "No comments yet" message
                parent.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
                return;
            }

            // Process each comment
            for (const comment of commentList) {
                try {
                    if (!comment || !comment._id) {
                        console.warn("Invalid comment data:", comment);
                        continue;
                    }
                    
                    const commentNode = createCommentNode(comment);
                    
                    if (commentNode) {
                        const repliesContainer = commentNode.querySelector(".replies");
                        
                        if (repliesContainer) {
                            const replies = finalData.comments.filter(
                                (reply) => reply.parent === comment._id,
                            );
                            
                            // Sort replies to show newest first
                            if (replies && replies.length) {
                                replies.sort((a, b) => {
                                    if (a.createdAt && b.createdAt) {
                                        // Handle Firestore timestamps
                                        const aDate = a.createdAt.toDate ? a.createdAt.toDate() : 
                                                    (a.createdAt.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt));
                                        const bDate = b.createdAt.toDate ? b.createdAt.toDate() : 
                                                    (b.createdAt.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt));
                                        return bDate - aDate;
                                    }
                                    return 0;
                                });
                                await initComments(replies, repliesContainer);
                            }
                        }
                        
                        appendComment(parent, commentNode, comment._id);
                    } else {
                        console.warn("Failed to create comment node for:", comment);
                    }
                } catch (commentError) {
                    console.error("Error processing individual comment:", commentError, comment);
                    // Continue with other comments instead of breaking the entire function
                }
            }
        } catch (error) {
            console.error("Error initializing comments:", error);
            createPopup("Error initializing comments", "error");
        }
    }

    // Auth handlers
    loginButton.addEventListener("click", () => {
        const username = loginUsernameInput.value.trim();
        if (!username) {
            createPopup("Please enter a valid username", "error");
            return;
        }

        currentUser = {
            username,
            image: { png: "images/user-image-with-black-background-svgrepo-com.svg"},
        };

        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        loginUsernameInput.value = "";
        updateLoginStatus();
        createPopup(`Logged in as ${username}`, "success");

        // Refresh the page after a brief delay to show the popup
        setTimeout(() => {
            window.location.reload();
        }, 500);
    });

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        currentUser = null;
        updateLoginStatus();
        createPopup("Successfully logged out", "success");

        // Refresh the page after a brief delay to show the popup
        setTimeout(() => {
            window.location.reload();
        }, 500);
    });

    const updateLoginStatus = () => {
        // Remove any existing login status indicators
        const existingIndicators = document.querySelectorAll('.login-status');
        existingIndicators.forEach(indicator => indicator.remove());
        
        // Create a new indicator directly on the body for proper fixed positioning
        const loginStatusIndicator = document.createElement("div");
        loginStatusIndicator.className = "login-status";
        document.body.appendChild(loginStatusIndicator);

        if (currentUser) {
            // Add logged-in class to body for CSS targeting
            document.body.classList.add('logged-in');
            document.body.classList.remove('logged-out');
            
            loginStatusIndicator.textContent = `Logged in as ${currentUser.username}`;
            loginStatusIndicator.classList.add("logged-in");
            loginStatusIndicator.classList.remove("logged-out");
            if (commentInputSection) commentInputSection.style.display = "grid";
            if (commentTextarea) commentTextarea.style.display = "block";
            loginUsernameInput.style.display = "none";
            loginButton.style.display = "none";
            logoutButton.style.display = "inline";
        } else {
            // Add logged-out class to body for CSS targeting
            document.body.classList.add('logged-out');
            document.body.classList.remove('logged-in');
            
            loginStatusIndicator.textContent = "Not logged in";
            loginStatusIndicator.classList.add("logged-out");
            loginStatusIndicator.classList.remove("logged-in");
            if (commentInputSection) commentInputSection.style.display = "none";
            if (commentTextarea) commentTextarea.style.display = "none";
            loginButton.style.display = "inline";
            logoutButton.style.display = "none";
            loginUsernameInput.style.display = "inline";
        }
    };

    // Initialize
    const init = async () => {
        try {
            console.log("Forum initialization started");
            
            // Get the main container
            const commentsContainer = document.querySelector(".interactive-comments");
            if (!commentsContainer) {
                console.error("Comments container not found");
                createPopup("Forum container not found", "error");
                return;
            }
            
            // Safely get the comments wrapper
            const commentsWrapper = commentsContainer.querySelector(".comments-wrp");
            if (!commentsWrapper) {
                console.error("Comments wrapper not found");
                createPopup("Comments wrapper not found", "error");
                return;
            }
            
            // Show loading animation right away
            createLoadingSpinner(commentsWrapper);
    
            // Verify Firebase connection
            if (!db) {
                console.error("Database connection not available during init");
                createPopup("Database connection missing", "error");
                return;
            }
    
            // Load data first
            console.log("Loading comments data...");
            const data = await loadData();
            console.log("Comments data loaded:", data);
    
            const existingMainInput = commentsContainer.querySelector(
                ".reply-input.main-input",
            );
            if (existingMainInput) {
                existingMainInput.remove();
            }
    
            // Create main input
            const mainInput = document.createElement("div");
            mainInput.className = "reply-input container main-input";
            mainInput.innerHTML = `
                <img src="${currentUser?.image?.png || "images/user-image-with-black-background-svgrepo-com.svg"}" alt="avatar" class="usr-img">
                <textarea class="cmnt-input" placeholder="Add a comment..."></textarea>
                <button class="bu-primary">SEND</button>
            `;
    
            commentsWrapper.parentNode.insertBefore(mainInput, commentsWrapper);
    
            const textarea = mainInput.querySelector(".cmnt-input");
            const sendButton = mainInput.querySelector(".bu-primary");
    
            if (sendButton && textarea) {
                sendButton.addEventListener("click", async () => {
                    if (!currentUser) {
                        createPopup("Please log in to comment", "error");
                        return;
                    }
    
                    const commentBody = textarea.value;
                    if (!commentBody.trim()) {
                        createPopup("Please enter a comment", "error");
                        return;
                    }
    
                    try {
                        // Disable button while sending to prevent double-clicks
                        sendButton.disabled = true;
                        sendButton.textContent = "Sending...";
                        
                        await addComment(commentBody);
                        textarea.value = "";
                    } catch (error) {
                        createPopup("Failed to add comment", "error");
                    } finally {
                        // Re-enable button
                        sendButton.disabled = false;
                        sendButton.textContent = "SEND";
                    }
                });
    
                // Add keypress event for Enter
                textarea.addEventListener("keydown", async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const commentBody = textarea.value;
                        if (!commentBody.trim()) {
                            createPopup("Please enter a comment", "error");
                            return;
                        }
                        await addComment(textarea.value);
                        textarea.value = "";
                    }
                });
            }
    
            // Initialize comments with the specific wrapper we found
            await initComments(null, commentsWrapper);
            updateLoginStatus();
        } catch (error) {
            console.error("Error during initialization:", error);
            createPopup("Error loading the forum: " + error.message, "error");
            // Try to recover by showing the login status at least
            updateLoginStatus();
        }
    }

    // Use DOMContentLoaded or call setupFirebase directly depending on document state
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            console.log("DOM loaded, setting up Firebase");
            setupFirebase();
        });
    } else {
        console.log("DOM already loaded, setting up Firebase immediately");
        setupFirebase();
    }
})();