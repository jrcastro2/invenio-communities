// This file is part of Invenio-Communities
// Copyright (C) 2024-2025 CERN.
//
// Invenio-Communities is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { http } from "react-invenio-forms";

/**
 * API Client for community collection trees.
 *
 * It mostly uses the API links passed to it from responses.
 *
 */
export class CommunityCollectionsApi {
  #communityId;
  baseUrl = "/api/communities/";

  constructor(community) {
    this.#communityId = community.id;
  }

  /**
   * Validate tree identifier parameters.
   * @private
   * @param {string|null} treeSlug - Tree slug
   * @param {string|null} treeId - Tree ID
   * @throws {Error} If neither parameter is provided
   */
  _validateTreeIdentifier(treeSlug, treeId) {
    if (!treeSlug && !treeId) {
      throw new Error("Either treeSlug or treeId must be provided");
    }
    if (treeSlug && treeId) {
      console.warn("Both treeSlug and treeId provided; both will be sent to backend");
    }
  }

  /**
   * Append tree_id to existing URL with query params.
   * @private
   * @param {string} url - Base URL (may include query params)
   * @param {string|null} treeId - Tree ID
   * @returns {string} URL with tree_id appended
   */
  _appendTreeId(url, treeId) {
    if (!treeId) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tree_id=${encodeURIComponent(treeId)}`;
  }

  /**
   * List all Community Collection Trees.
   *
   * @param {number} depth - Depth of the collection tree
   * @param {object} options - Custom options
   */
  async get_collection_trees(depth, options) {
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    const url = `${this.baseUrl}${this.#communityId}/collection-trees?depth=${depth}`;
    return http.get(url, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Create a new Community Collection Tree.
   *
   * @param {object} payload - Serialized Collection object
   * @param {object} options - Custom options
   */
  async create_collection_trees(payload, options) {
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    const collectionTrees = await this.get_collection_trees(10, options);
    let maxOrder = Math.max(
      ...Object.values(collectionTrees.data).map((tree) => tree.order || 0),
      0
    );
    payload.order = maxOrder + 1;
    const url = `${this.baseUrl}${this.#communityId}/collection-trees`;
    return http.post(url, payload, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Update a Community Collection Tree.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {object} payload - Serialized Collection object
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   */
  async update_collection_tree(treeSlug, payload, options, treeId = null) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${this.#communityId}/collection-trees/${treeSlug}`;
    url = this._appendTreeId(url, treeId);
    return http.put(url, payload, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Delete a Community Collection Tree.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   * @param {boolean} cascade - Delete all collections in the tree (default: false)
   */
  async delete_collection_tree(treeSlug, options, treeId = null, cascade = false) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${this.#communityId}/collection-trees/${treeSlug}`;
    url = this._appendTreeId(url, treeId);
    // Append cascade parameter if true
    const separator = url.includes("?") ? "&" : "?";
    if (cascade) {
      url = `${url}${separator}cascade=true`;
    }
    return http.delete(url, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Get a Community Collection Tree.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   */
  async get_collection_tree(treeSlug, options, treeId = null) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${
      this.#communityId
    }/collection-trees/${treeSlug}?depth=10`;
    url = this._appendTreeId(url, treeId);
    return http.get(url, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Create a new Community Collection.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {object} payload - Serialized Collection object
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   */
  async create_collection(treeSlug, payload, options, treeId = null) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    };
    const collections = await this.get_collection_tree(treeSlug, options, treeId);
    let maxOrder = Math.max(
      ...Object.values(collections.data.collections).map((tree) => tree.order || 0),
      0
    );
    payload.order = maxOrder + 1;
    let url = `${this.baseUrl}${
      this.#communityId
    }/collection-trees/${treeSlug}/collections`;
    url = this._appendTreeId(url, treeId);
    return http.post(url, payload, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Add a new Community Collection to parent collection.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {string} collectionSlug - Slug of the parent collection
   * @param {object} payload - Serialized Collection object
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   */
  async add_collection(treeSlug, collectionSlug, payload, options, treeId = null) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${
      this.#communityId
    }/collection-trees/${treeSlug}/collections/${collectionSlug}`;
    url = this._appendTreeId(url, treeId);
    return http.post(url, payload, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Update a Community Collection.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {string} collectionSlug - Slug of the collection
   * @param {object} payload - Serialized Collection object
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   */
  async update_collection(treeSlug, collectionSlug, payload, options, treeId = null) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${
      this.#communityId
    }/collection-trees/${treeSlug}/collections/${collectionSlug}`;
    url = this._appendTreeId(url, treeId);
    return http.put(url, payload, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Delete a Community Collection.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {string} collectionSlug - Slug of the collection
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   * @param {boolean} cascade - Whether to delete child collections (default: false)
   */
  async delete_collection(
    treeSlug,
    collectionSlug,
    options,
    treeId = null,
    cascade = false
  ) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${
      this.#communityId
    }/collection-trees/${treeSlug}/collections/${collectionSlug}`;
    url = this._appendTreeId(url, treeId);
    // Append cascade parameter if true
    const separator = url.includes("?") ? "&" : "?";
    if (cascade) {
      url = `${url}${separator}cascade=true`;
    }
    return http.delete(url, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Get a Community Collection.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {string} collectionSlug - Slug of the collection
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   */
  async get_collection(treeSlug, collectionSlug, options, treeId = null) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${
      this.#communityId
    }/collection-trees/${treeSlug}/collections/${collectionSlug}`;
    url = this._appendTreeId(url, treeId);
    return http.get(url, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Test search query for a Community Collection.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {string} collectionSlug - Slug of the collection
   * @param {object} payload - Serialized Collection object
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   */
  async test_search_query_for_collection(
    treeSlug,
    collectionSlug,
    payload,
    options,
    treeId = null
  ) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${
      this.#communityId
    }/collection-trees/${treeSlug}/collections-records-test?test_col_slug=${collectionSlug}`;
    url = this._appendTreeId(url, treeId);
    return http.post(url, payload, {
      headers: headers,
      ...options,
    });
  }

  /**
   * Test search query for a Community Base Collection of tree.
   *
   * @param {string} treeSlug - Slug of the collection tree
   * @param {object} payload - Serialized Collection object
   * @param {object} options - Custom options
   * @param {string|null} treeId - Tree ID (optional)
   */
  async test_search_query_for_base_collection(
    treeSlug,
    payload,
    options,
    treeId = null
  ) {
    this._validateTreeIdentifier(treeSlug, treeId);
    options = options || {};
    const headers = {
      Accept: "application/json",
    };
    let url = `${this.baseUrl}${
      this.#communityId
    }/collection-trees/${treeSlug}/collections-records-test`;
    url = this._appendTreeId(url, treeId);
    return http.post(url, payload, {
      headers: headers,
      ...options,
    });
  }
}
