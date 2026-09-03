# Working with Nodes

> **Version:** v0.2 (beta)

Nodes are the building blocks of your mind map. Each node holds one idea. This guide covers how to add, edit, move, collapse, and delete nodes.

---

## What is a Node?

A node is a rectangular card that holds a text label. Nodes connect to each other with lines, forming the tree structure of your mind map.

- The **root node** is the central idea at the top of the map.
- **Child nodes** branch out below their parent.
- **Sibling nodes** are at the same level, sharing the same parent.

[SCREENSHOT: A mind map with labels pointing to the root node, a child node, and a sibling node]

---

## Selecting a Node

**Click** any node to select it. The node highlights and the **Node Editor** panel opens on the right side of the screen.

---

## Adding Nodes

### Add a child node (sub-idea)

A child node appears *below* the selected node in the hierarchy.

| Method | How |
|---|---|
| Keyboard | Select a node → press **Tab** |
| Node Editor | Click **Add Child** in the panel |

### Add a sibling node (same level)

A sibling node appears *next to* the selected node, sharing the same parent.

| Method | How |
|---|---|
| Keyboard | Select a node → press **Enter** |
| Node Editor | Click **Add Sibling** in the panel |

> **Note:** You cannot add a sibling to the root node — it has no parent.

[SCREENSHOT: The Node Editor panel showing the Add Child, Add Sibling, and Delete buttons]

---

## Editing a Node's Text

1. **Double-click** the node on the canvas.  
   *Or* click the node once to select it — the **Node Info** field in the Node Editor is immediately ready to edit.
2. Type your text.
3. Press **Enter** to confirm, or **Escape** to cancel.

---

## Deleting a Node

> ⚠️ **Warning:** Deleting a node also deletes all of its children. Use **Ctrl + Z** to undo immediately if needed.

| Method | How |
|---|---|
| Keyboard | Select the node → press **Delete** or **Backspace** |
| Node Editor | Click **Delete** in the panel |

---

## Moving (Reparenting) a Node

You can drag a node to a different parent:

1. Click and hold the node you want to move.
2. Drag it toward another node until you are within **100 px** of it.
3. Release — the dragged node becomes a child of the target node.

If you release without getting close enough to another node, the dragged node snaps back to its original position.

[SCREENSHOT: A node being dragged close to another node to reparent it]

---

## Collapsing and Expanding Branches

When a node has children, a small **+** or **−** button appears below it on the canvas.

| Button | Action |
|---|---|
| **−** | Collapse — hide all children of this node |
| **+** | Expand — show all children again |

> 💡 **Tip:** Collapsing branches helps you focus on one part of a large map. When you search for a node, MindMapper automatically expands any collapsed branches that contain a match.

[SCREENSHOT: A node with its collapse/expand button visible below it]

---

## Undo and Redo

Every action you take is tracked. You can step back through your entire session.

| Action | Shortcut | Toolbar |
|---|---|---|
| Undo | **Ctrl + Z** | Undo button |
| Redo | **Ctrl + Y** | Redo button |

History is unlimited within a session and resets when you close the map.

---

## See Also

- [Styling Nodes](styling.md)
- [Views and Navigation](views.md)
- [Keyboard Shortcuts](keyboard-shortcuts.md)

---

*← [Back to Documentation Index](index.md)*
