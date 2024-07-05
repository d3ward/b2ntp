//Manage sidebar
export function sidebar() {
	var t = this || window
	t.m = false;
	t.n = document.querySelector("aside").classList;
	t.listener = function () {
	  t.b = document.querySelector(".open-aside");
	  t.b.addEventListener("click", function () {
		if (t.m) {
		  t.n.remove("opened");
		  t.m = false;
		} else {
		  t.n.add("opened");
		  t.m = true;
		}
	  });
	};
	t.close = function () {
	  document.getElementById("mySidebar").style.width = "85px";
	  document.getElementById("main").style.marginLeft = "85px";
	  t.mini = true;
	};
	t.open = function () {
	  document.getElementById("mySidebar").style.width = "250px";
	  document.getElementById("main").style.marginLeft = "250px";
	  t.mini = false;
	};
	t.listener();
  }