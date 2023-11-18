$(document).ready(function () {
    // runs after the document is ready. (Duh!)
    let TaskModel = Backbone.Model.extend({
        initialize() {
            fetch("http://localhost:8080/getTasks")
                .then((data) => {
                    return data.json();
                })
                .then((jsonData) => {
                    this.set("tasksArray", jsonData);
                    tasksView.render(this.get("tasksArray"));
                });
        },
        addTask: function (taskName) {
            console.log(taskName)
            let tasksArray = this.get("tasksArray");
            tasksArray.push({ task: taskName, completed: false });
            this.set("tasksArray", tasksArray);
            fetch("http://localhost:8080/addTask?task=" + taskName);
            console.log(this.get("tasksArray"))
            tasksView.render(this.get("tasksArray"));
        },
        markTaskCompleted: function (taskName) {
            let tasksArray = this.get("tasksArray");
            tasksArray.forEach(item => {
                if (item.task === taskName) {
                    item.completed = true;
                }
            });
            fetch("http://localhost:8080/markCompleted?task=" + encodeURIComponent(taskName), {
                method: 'PUT' // or 'POST'
            });

            tasksView.render(this.get("tasksArray"))
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
            for (let i = 0; i < tasksArray.length; i++) {
                if (tasksArray[i].completed === false) {
                    let element = $(`<li>${tasksArray[i].task}</li>`);
                    element.on("click", function () {
                        tasksModel.markTaskCompleted(tasksArray[i].task);
                    });
                    element.hover(function () {
                        $(this).css("cursor", "pointer");
                    });

                    element.appendTo("#tasks");
                }
            }

            for (let i = 0; i < tasksArray.length; i++) {
                if (tasksArray[i].completed === true) {
                    let element = $(
                        `<li class="text-decoration-line-through">${tasksArray[i].task}</li>`
                    );
                    element.hover(function () {
                        $(this).css("cursor", "pointer");
                    });
                    element.appendTo("#tasks");
                }
            }
        },
    });

    let tasksView = new TasksView();

    $("#addtask").click(function () {
        let val = $("#task-inp").val();
        $("#task-inp").val("");
        tasksModel.addTask(val);
    });
});