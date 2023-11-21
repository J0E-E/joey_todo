$(document).ready(function () {
    // runs after the document is ready. (Duh!)
    let TaskModel = Backbone.Model.extend({
        // Model for Tasks in Joey's todo app.
        initialize() {
            this.getTasks()
        },
        getTasks: function () {
            // Fetch Tasks from DB, and render the view.
            fetch("http://localhost:8080/getTasks", {
                method: 'GET'
            }).then((data) => {
                    return data.json();
                }).then((jsonData) => {
                    this.set("tasksArray", jsonData);
                    tasksView.render(this.get("tasksArray"));
                }).catch(()=>{
                    // TODO: Add some exception handling for this method.
            });
        },
        addTask: function (taskName) {
            // Add tasks to DB and render the view.
            fetch("http://localhost:8080/addTask?task=" + taskName, {
                method: 'POST'
            }).then((response) => {
                if(!response.ok){
                    throw new Error('Network response was not ok ' + response.statusText)
                }
                return response.json()
            }).then((data) => {
                this.getTasks()
            }).catch((error)=>{
                console.log(error)
                this.getTasks()
            })
        },
        toggleCompleted: function (taskUID) {
            // Toggle the completed status of a task.
            let tasksArray = this.get("tasksArray");
            fetch("http://localhost:8080/toggleCompleted?uid=" + encodeURIComponent(taskUID), {
                method: 'PUT' // or 'POST'
            }).then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText)
                }
                return response.json()
            }).then((data) => {
                this.getTasks()
            }).catch(()=> {
                // TODO: Add some exception handling for this method.
            })
        },
        clearCompleted: function() {
            // Clear all completed tasks from the DB.
            fetch("http://localhost:8080/clearCompleted", {
                method: 'DELETE'
            }).then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText)
                }else {
                    this.getTasks()
                }
            })
        }
    });

    let tasksModel = new TaskModel();

    let TasksView = Backbone.View.extend({
        el: '#tasks',
        initialize() {
            this.render([]);
        },
        render(tasksArray) {
            this.$el.html("");
            // Render the uncompleted Tasks.
            for (let i = 0; i < tasksArray.length; i++) {
                if (tasksArray[i].completed === false) {
                    let element = $(`<li>${tasksArray[i].task}</li>`);
                    element.on("click", function () {
                        tasksModel.toggleCompleted(tasksArray[i].uid);
                    });
                    element.hover(function () {
                        $(this).css("cursor", "pointer");
                    });

                    element.appendTo("#tasks");
                }
            }
            // Render the completed Tasks.
            for (let i = 0; i < tasksArray.length; i++) {
                if (tasksArray[i].completed === true) {
                    let element = $(
                        `<li class="text-decoration-line-through">${tasksArray[i].task}</li>`
                    );
                    element.on("click", function () {
                        tasksModel.toggleCompleted(tasksArray[i].uid);
                    });
                    element.hover(function () {
                        $(this).css("cursor", "pointer");
                    });
                    element.appendTo("#tasks");
                }
            }
        },
    });

    let tasksView = new TasksView();

    // Function for the "Add Task!" button.
    $("#addtask").click(function () {
        let val = $("#task-inp").val();
        $("#task-inp").val("");
        tasksModel.addTask(val);
    });

    // Add tasks on enter from keyboard.
    $("#task-inp").keypress(function (event) {
        if (event.which === 13) {
           let val = $(this).val();
           $(this).val("");
           tasksModel.addTask(val)
        }
    })

    // Function for "Clear All Completed" button.
    $("#clearAllCompleted").click(function() {
        tasksModel.clearCompleted();
    })
});