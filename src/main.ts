enum ComparisonResult { ORDERED , EQUAL , UNORDERED };
type Comparator<T> = (first:T, second:T) => ComparisonResult;

class Tree<T> { 
    parent_: Tree<T>|null = null;
    left_: Tree<T>|null = null;
    right_: Tree<T>|null = null;
    height_: number;
    balance_: number;
    value_: T;
    constructor(val :T){
        this.value_ = val;
        this.height_ = 1;
        this.balance_ = 0;
    }
    get value() { return this.value_; }
    get height() { return this.height_; }
    get balance() { return this.balance_ }

    // Getter/Setters for left/right children will enforce the parent/child relationship
    // as well as re-validate heights/balance factors.
    get left() { return this.left_; }
    set left(child: Tree<T>|null) { 
        if(child) {
            child.parent_ = this;
        }
        this.left_ = child;
        this.revalidate_();
    }

    get right() { return this.right_; }
    set right(child: Tree<T>|null) { 
        if(child) {
            child.parent_ = this;
        }
        this.right_ = child;
        this.revalidate_();
    }

    revalidate_() {
        const leftHeight = this.left_ === null? 0: this.left_.height;
        const rightHeight = this.right_ === null? 0: this.right_.height;
        const newHeight = (leftHeight > rightHeight ? leftHeight : rightHeight) + 1;
        this.balance_ = rightHeight - leftHeight; // Even if the height doesn't change, this may.
        if(newHeight == this.height_)
            return;
        this.height_ = newHeight;
        if(this.parent_)
            this.parent_.revalidate_();
    }

    insert(val:T, compare:Comparator<T>):Tree<T> {
        return insert_<T>(val, compare, this);
    }
};

function balanced_(tree:Tree<any>|null): boolean {
    if(tree === null) return true;
    const b = tree.balance; // save the getter call.
    return b*b <= 1;
}

function insert_<T>(val:T, comparator:Comparator<T>, tree:Tree<T>|null) : Tree<T> {
    console.log(`Called insert(${val}) on tree ${tree==null?null:tree.value}`)
    if(tree == null) return new Tree(val);

    let goLeft = false;
    switch(comparator(val, tree.value)) {
        // If val comes before (or equals) tree.value, go left.
        case ComparisonResult.ORDERED:
        case ComparisonResult.EQUAL:
            goLeft = true;
        break 
        default: // otherwise go right.
            goLeft = false;
    }
    
    const child = insert_(val, comparator, goLeft ? tree.left : tree.right);
    if(goLeft)
        tree.left = child;
    else
        tree.right = child;
        
    if (balanced_(tree))
        return tree;
    
    // && tree.right is tecnically unnecessary but the type system isn't smart enough.
    if(tree.balance > 0 && tree.right) {
        // Right
        if(tree.right.balance < 0) {
            // Right Left
            tree.right = rightRotate(tree.right);
        }
        // Right Right, also Right Left part 2
        tree = leftRotate(tree);
    } else if (tree.balance < 0 && tree.left) {
        if(tree.left.balance > 0) {
            // LR
            tree.left = leftRotate(tree.left);
        }
        // LR(2) and LL
        tree = rightRotate(tree);
    }
    return tree;
}

function rightRotate<T>(root: Tree<T>):Tree<T> {
    const pivot = root.left;
    if(pivot == null) return root;
    root.left = pivot.right;
    pivot.right = root;
    return pivot;
}
function leftRotate<T>(root: Tree<T>): Tree<T> {
    const pivot = root.right;
    if(pivot == null) return root;
    root.right = pivot.left;
    pivot.left = root;
    return pivot;
}


export class BlancedTree<T> {
    root_ : Tree<T>|null;
    comp_ : Comparator<T>;
    constructor(comp: Comparator<T>) {
        this.root_ = null;
        this.comp_ = comp;
    }
    insert(v:T) {
        console.log("---",v);
        if(this.root_ == null) {
            this.root_ = new Tree<T>(v);
            return;
        }
        this.root_ = this.root_.insert(v, this.comp_);
    }
    get root() {return this.root_; }
}



function printTree(tree:Tree<any>|null, prefix:string = "") {
    if(!tree) return;
    
    printTree(tree.right, prefix.replace("/--", "   ").replace("\\--", "|  ") +" /--");
    console.log(prefix + tree.value);
    printTree(tree.left, prefix.replace("\\--", "   ").replace("/--", "|  ") +" \\--");
}
function shuffle(a:Array<any>) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

let t = new BlancedTree<number>((a,b)=>{
    if(b<a)
        return ComparisonResult.ORDERED;
    if(b>a)
        return ComparisonResult.UNORDERED;
    return ComparisonResult.EQUAL;
});

let arr:Array<number> = [];
for(let i = 1 ; i < 100 ; i++ )
    arr.push(i);
//shuffle(arr);
arr.forEach(v=>t.insert(v));

printTree(t.root);