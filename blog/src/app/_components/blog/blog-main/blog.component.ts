import { Component, OnInit } from '@angular/core';
import {Subject} from 'rxjs';
import { isNullOrUndefined } from 'util';

import { Post } from '../../../_models/post.model';
import { Category } from '../../../_models/category.model';
import { PostService } from '../../../_services/post.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  title = 'Blog';
  posts: Post[] = [];
  lastPosts: Post[] = [];
  categories: Category[] = [];
  selectedCategory: Category = null;
  private searchTerm = new Subject<string>();
  private searchText = '';
  pager = {
    limit: 2,
    current: 0,
    reachedEnd: false,
    isLoading: false
  };
  lastPostsCount = 5;

  constructor(private postService: PostService) {
    this.title = 'Blog';

    this.searchTerm.debounceTime(200).distinctUntilChanged().subscribe(searchTerm => {
      this.postService.search(searchTerm, this.pager.limit, this.pager.limit * this.pager.current).subscribe(response => {
        this.posts = response as Post[];
      }, err => {
        console.log(err);
      });
    });
  }

  ngOnInit() {
    this.getPostsPerPage();
    this.getLastPosts();
    this.getCategories();
  }

  getPosts(mustRefresh: boolean) {
    if (mustRefresh) {
      this.pager.current = 0;
      this.pager.reachedEnd = false;
    }
    
    this.postService.search(this.searchText, this.pager.limit, this.pager.limit * this.pager.current).subscribe(response => {
      this.posts = response as Post[];
    }, err => {
      console.log(err);
    });
  }

  getPostsPerPage() {

    this.postService.search(this.searchText, 
                            this.pager.limit, 
                            this.pager.limit * this.pager.current,
                            isNullOrUndefined(this.selectedCategory) ? "" : this.selectedCategory.id).subscribe(res => {
      //this.posts = res as Post[];
      console.log(res);
      this.pager.isLoading = false;

      if (res != null && res.length) {
        this.posts = this.posts.concat(res);
        console.log(this.posts[0].comments);
       } else { 
        this.pager.reachedEnd = true;
      }

    }, err => {
      console.log(err);
    });
  }

  getLastPosts() {
    this.postService.getLastPosts(this.lastPostsCount).subscribe(res => {
      this.lastPosts = res.slice(0,5) as Post[];
    }, err => {
      console.log(err);
    });
  }

  getCategories() {
    this.postService.getCategories().subscribe(res => {
      this.categories = res as Category[];
    }, err => {
      console.log(err);
    });
  }

  getCategoryById(id) {
    var cat =  this.categories.find(res => res.id===id);
    if (!isNullOrUndefined(cat)) {
      return cat.title;
    }
    return null;
  }

  loadMore() {
    console.log('load more');
    this.pager.isLoading = true;
    this.pager.current = this.pager.current + 1;
    this.getPostsPerPage();
  }

  onKeyup(searchText: string){
        this.searchText = searchText;
        this.pager.current = 0;
        this.pager.reachedEnd = false;
        this.searchTerm.next(searchText);
        // if(searchText !== ''){
        //   this.searchTerm.next(searchText);
        // }       
  }

  onCategoryChanged(cat: Category) {
    this.pager.current = 0;
    this.pager.reachedEnd = false
    this.selectedCategory = cat;
    this.getPostsPerPage();

  }


}
